from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView, ListCreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from api.models import Video, Comment
import sys
sys.path.append('/mnt/c/vscode/vscodeprog/qweqwe_video/myenv/lib/python3.12/site-packages')
from api.serializers import VideoSerializer, RegistrationSerializer, UserSerializer, CommentSerializer
from django.core.files import File
import os
from django.conf import settings
import sys

MOVIEPY_INSTALLED = False

try:
    from moviepy import VideoFileClip
    MOVIEPY_INSTALLED = True
    print("moviepy.editor imported successfully!")
except ImportError as e:
    print(f"Error importing moviepy.editor: {e}")
    print("Warning: moviepy not installed. Thumbnail generation will be skipped.")

class CurrentUserView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserVideoListView(ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Video.objects.filter(author=self.request.user)

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'destroy', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        instance = serializer.save(author=self.request.user)
        if MOVIEPY_INSTALLED and instance.video:
            try:
                video_path = instance.video.path
                temp_thumbnail_path = os.path.join(settings.MEDIA_ROOT, f'temp_thumbnail_{instance.pk}.jpg')
                clip = VideoFileClip(video_path)
                frame_time = min(0.5, clip.duration / 2) if clip.duration else 0.5
                clip.save_frame(temp_thumbnail_path, t=frame_time)
                clip.close()
                with open(temp_thumbnail_path, 'rb') as f:
                    thumbnail_filename = f'thumbnail_{instance.pk}_{os.path.splitext(os.path.basename(video_path))[0]}.jpg'
                    instance.thumbnail.save(thumbnail_filename, File(f), save=True)
                os.remove(temp_thumbnail_path)
            except Exception as e:
                print(f"Error generating thumbnail for video {instance.pk}: {e}")
                instance.thumbnail = None
                instance.save(update_fields=['thumbnail'])

class RegistrationAPIView(generics.GenericAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": RegistrationSerializer(user, context=self.get_serializer_context()).data,
            "message": "Пользователь успешно зарегистрирован."
        }, status=201)

class VideoCommentsListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        video_id = self.kwargs['video_id']
        video = Video.objects.filter(pk=video_id).first()
        if video:
            return Comment.objects.filter(video=video)
        return Comment.objects.none()

    def perform_create(self, serializer):
        video_id = self.kwargs['video_id']
        video = Video.objects.get(pk=video_id)
        serializer.save(video=video, author=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
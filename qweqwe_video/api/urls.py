from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import RegistrationAPIView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve
from .views import (
    CurrentUserView,
    UserVideoListView,
    VideoCommentsListCreateView
)



router = DefaultRouter()
router.register(r'videos', views.VideoViewSet)



urlpatterns = [
    path('register/', RegistrationAPIView.as_view(), name='register'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('videos/user/', UserVideoListView.as_view(), name='user-videos'),
    path('videos/<int:video_id>/comments/', VideoCommentsListCreateView.as_view(), name='video-comments-list-create'),

    path('', include(router.urls)),
    
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
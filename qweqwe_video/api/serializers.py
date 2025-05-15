# api/serializers.py

from rest_framework import serializers
from .models import Video # Убедитесь, что этот импорт нужен, если VideoSerializer здесь
from .models import Comment
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# --- Определите требуемый код доступа ---
# Для простоты примера, хардкодим его здесь.
# В реальном приложении лучше хранить его в settings.py и импортировать:
# from django.conf import settings
# REQUIRED_ACCESS_CODE = settings.REGISTRATION_ACCESS_CODE
REQUIRED_ACCESS_CODE = "RGZ2025IKS431"
# --- Конец определения кода ---


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class VideoSerializer(serializers.ModelSerializer):
    # Поле username автора только для чтения
    author_username = serializers.ReadOnlyField(source='author.username')
    # Поле для получения полного URL файла видео
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            'id',
            'title',
            'description',
            # 'file', # <-- УДАЛЕНО: Модель имеет поле 'video', а не 'file' - Оставлено как комментарий из вашего кода
            'video', # <-- ОСТАВЛЕНО: Это имя поля в вашей модели Video
            'file_url', # Поле для полного URL файла видео (SerializerMethodField)
            'author', # Поле автора (ForeignKey)
            'author_username', # Поле username автора (ReadOnlyField)
            'uploaded_at',
            'thumbnail' # Поле миниатюры
        ]
        # Поля, которые не могут быть изменены при создании/обновлении через этот сериализатор
        read_only_fields = ['author', 'uploaded_at', 'thumbnail']
        # Если у вас есть другие read_only поля, добавьте их сюда

    # Метод для получения полного URL файла видео
    def get_file_url(self, obj):
        request = self.context.get('request')
        # Проверяем наличие файла и объекта запроса
        if obj.video and request: # <-- Используем obj.video, т.к. это имя поля в модели
            # Возвращаем полный URL файла видео
            return request.build_absolute_uri(obj.video.url)
        # Если файла нет или нет объекта запроса, возвращаем None
        return None

    # Переопределяем метод create для автоматического назначения автора
    def create(self, validated_data):
        # Устанавливаем текущего пользователя как автора видео
        validated_data['author'] = self.context['request'].user
        # Вызываем стандартный метод create для сохранения объекта
        return super().create(validated_data)

# Сериализатор для регистрации пользователя
class RegistrationSerializer(serializers.ModelSerializer):
    # Поле для пароля (только для записи, обязательное, с валидаторами)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password] # Используем стандартные валидаторы Django для пароля
    )
    # Поле для подтверждения пароля (только для записи, обязательное)
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        required=True
    )
    # --- ДОБАВЛЕНО: Поле для кода доступа ---
    access_code = serializers.CharField(
        write_only=True, # Поле только для записи (не будет в ответе API)
        required=True    # Поле обязательно для регистрации
    )
    # --- Конец добавленного поля ---


    class Meta:
        model = User
        # --- ДОБАВЛЕНО: Включаем access_code в список полей ---
        fields = ('username', 'email', 'password', 'password2', 'access_code')
        # --- Конец добавления поля ---
        # Убеждаемся, что email обязателен
        extra_kwargs = {
            'email': {'required': True}
        }

    # Метод для дополнительной валидации (сравнение паролей, проверка email, проверка кода доступа)
    def validate(self, attrs):
        # Проверяем совпадение паролей
        if attrs.get('password') != attrs.get('password2'):
            # Используем serializers.ValidationError для правильной обработки DRF
            raise serializers.ValidationError({"password": "Пароли не совпадают"})

        # Проверяем, не занят ли email
        # Используем .get() для безопасного доступа к email
        if User.objects.filter(email=attrs.get('email')).exists():
             # Используем serializers.ValidationError
             raise serializers.ValidationError({"email": "Этот email уже используется"})

        # --- ДОБАВЛЕНО: Проверка кода доступа ---
        provided_code = attrs.get('access_code')

        # Проверяем, был ли код предоставлен и совпадает ли он с требуемым
        if not provided_code or provided_code != REQUIRED_ACCESS_CODE:
            # Возвращаем ошибку валидации для поля access_code
            raise serializers.ValidationError({"access_code": "Неверный или отсутствует код доступа."})
        # --- Конец добавленной проверки ---


        # Если все проверки пройдены, возвращаем валидированные данные
        # attrs.pop('password2', None) # Можно удалить password2 здесь
        # attrs.pop('access_code', None) # Можно удалить access_code здесь

        return attrs # Возвращаем валидированные данные

    # Переопределяем метод create для создания пользователя
    def create(self, validated_data):
        # --- ДОБАВЛЕНО: Удаляем поля, которых нет в модели User ---
        # Удаляем password2 и access_code из validated_data, т.к. их нет в модели User
        validated_data.pop('password2', None)
        validated_data.pop('access_code', None) # Удаляем поле кода доступа
        # --- Конец удаления полей ---

        # Создаем пользователя с помощью create_user (автоматически хэширует пароль)
        user = User.objects.create_user(**validated_data)
        return user
class CommentSerializer(serializers.ModelSerializer):
    # Это поле будет содержать ТОЛЬКО строку с именем пользователя
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Comment
        fields = ['id', 'video', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'video', 'author', 'created_at']

    # Метод create не всегда нужен для простых POST запросов,
    # ViewSet может автоматически связать поля, но можно переопределить,
    # чтобы установить видео и автора из контекста запроса.

    # Пример переопределения create (если не используете ViewSet или нужен контроль):
    # def create(self, validated_data):
    #    # Получаем объект видео из URL (через lookup_field в View)
    #    video_id = self.context['view'].kwargs['video_id']
    #    video = Video.objects.get(pk=video_id)
    #    validated_data['video'] = video
    #    validated_data['author'] = self.context['request'].user
    #    return super().create(validated_data)
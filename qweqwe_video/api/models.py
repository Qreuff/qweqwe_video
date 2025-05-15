from django.db import models
from django.contrib.auth.models import User
from .validators import validate_video_file

class Video(models.Model):
    """Модель представляет видеофайл и связанные с ним данные"""
    thumbnail = models.ImageField(
        upload_to='thumbnails/',
        verbose_name='Миниатюра',
        null=True,
        blank=True
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Название видео'
    )
    description = models.TextField(
        verbose_name='Описание видео'
    )
    video = models.FileField(
        upload_to='videos/',
        verbose_name='Видеофайл',
        validators=[validate_video_file]  # Добавляем валидатор
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Автор'
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата загрузки'
    )

    def __str__(self):
        return self.title

class Comment(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author.username} on {self.video.title[:20]}'
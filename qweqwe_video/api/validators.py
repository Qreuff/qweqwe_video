from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_video_file(value):
    valid_mime_types = ['video/mp4', 'video/webm', 'video/ogg']
    
    if value.content_type not in valid_mime_types:
        raise ValidationError(
            _('Неподдерживаемый формат. Используйте MP4, WebM или OGG')
        )
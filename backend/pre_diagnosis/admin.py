from django.contrib import admin
from .models import PreDiagnosis, CustomUser


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'openid', 'is_active', 'is_staff')
    search_fields = ('username', 'openid')


class PreDiagnosisAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'answer')
    search_fields = ('user__username', 'question', 'answer')


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(PreDiagnosis, PreDiagnosisAdmin)

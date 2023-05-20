from django.urls import path
from . import views

urlpatterns = [
    path('pre_diagnosis/', views.pre_diagnosis, name='pre_diagnosis'),
]

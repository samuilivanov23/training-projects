from django import forms

class LoginCustomerForm(forms.Form):
    email_address = forms.CharField(label='Email address', max_length=100)
    password = forms.CharField(label='Password', max_length=100)
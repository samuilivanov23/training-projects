from django import forms

class LoginCustomerForm(forms.Form):
    email_address = forms.CharField(label='Email address', max_length=100)
    password = forms.CharField(label='Password', max_length=100, widget=forms.PasswordInput)

class RegisterCustomerForm(forms.Form):
    first_name = forms.CharField(label='First name', max_length=100)
    last_name = forms.CharField(label='Last name', max_length=100)
    username = forms.CharField(label='Username', max_length=100)
    email_address = forms.CharField(label='Email address', max_length=100)
    password = forms.CharField(label='Password', max_length=100, widget=forms.PasswordInput)

class SelectProductQuantity(forms.Form):
    def __init__(self, quantity, *args, **kwargs):
        if type(quantity) == int:
            super(SelectProductQuantity, self).__init__(*args, **kwargs)
            self.fields['quantity'] = forms.ChoiceField(choices=tuple([(i+1, i+1) for i in range(quantity)]))
        else:
            int_quantity = int(quantity['quantity'])
            super(SelectProductQuantity, self).__init__(*args, **kwargs)
            self.fields['quantity'] = forms.ChoiceField(choices=tuple([(i+1, i+1) for i in range(int_quantity)]))
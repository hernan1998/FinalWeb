import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  type = '';
  dis: boolean;

  constructor(private authService: AuthService, private _router: Router) {}

  ngOnInit(): void {}

  async tryLogin() {
    Swal.fire({
      html: '<span class="fas fa-spinner fa-spin" style="width: 30px;"></span>',
      showConfirmButton: false,
    });
    var mail = $('#inputEmail').val().toString();
    var pass = $('#inputPassword').val().toString();
    await this.authService.login(mail, pass).catch((e) => {
      Swal.fire('Error', '' + e, 'error');
    });
  }

  async tryRegister() {
    const { value: formValues } = await Swal.fire({
      title: 'Register',
      html:
        '<hr />' +
        '<label>Name of the legal representative</label>' +
        '<input id="User" class="swal2-input">' +
        '<label>Document number</label>' +
        '<input id="docUser" class="swal2-input">' +
        '<label>Email</label>' +
        '<input id="mailUser" class="swal2-input">' +
        '<label>Name of the Company</label>' +
        '<input id="compUser" class="swal2-input">' +
        '<label>Password</label>' +
        '<input id="pass" type="password" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          $('#User').val().toString(),
          $('#docUser').val().toString(),
          $('#mailUser').val().toString(),
          $('#compUser').val().toString(),
          $('#pass').val().toString(),
        ];
      },
    });
    if (formValues) {
      try {
        this.authService
          .register(
            formValues[0],
            formValues[1],
            formValues[2],
            formValues[3],
            formValues[4]
          )
          .then(() => {
            Swal.fire('Success', 'Company created', 'success').then(() => {
              this._router.navigate(['/home']);
            });
          });
      } catch (e) {
        Swal.fire('Error', 'Errore creating company', 'error');
      }
    }
  }
}

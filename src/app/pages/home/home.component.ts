import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  //Variables
  name: string = '';
  cc: string = '';
  mail: string = '';
  company: string = '';
  operators = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    var id = this.authService.userId;
    this.authService.userData(id).subscribe((data) => {
      this.name = data.payload.data()['nombre'];
      this.mail = data.payload.data()['mail'];
      this.cc = data.payload.data()['cedula'];
      this.company = data.payload.data()['compName'];
    });
    this.authService.getOps().subscribe((data) => {
      this.operators = data.map((e) => {
        return {
          id: e.payload.doc.id,
          name: e.payload.doc.data()['nombre'],
          email: e.payload.doc.data()['mail'],
        };
      });
    });
  }

  async createOp() {
    const { value: formValues } = await Swal.fire({
      title: 'Register new operator',
      html:
        '<hr />' +
        '<label>Name operator</label>' +
        '<input id="User" class="swal2-input">' +
        '<label>Email</label>' +
        '<input id="mailUser" class="swal2-input">' +
        '<label>Password</label>' +
        '<input id="pass" type="password" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          $('#User').val().toString(),
          $('#mailUser').val().toString(),
          $('#pass').val().toString(),
        ];
      },
    });
    if (formValues) {
      this.authService
        .createOp(formValues[0], formValues[1], formValues[2])
        .then(() => {
          Swal.fire('Success', 'Operator created', 'success').then(() => {
            this.router.navigate(['login']);
          });
        })
        .catch((e) => {
          Swal.fire('Error', 'Error creating operator', 'error');
        });
    }
  }
}

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
  cuestionarios = [];

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
          status: e.payload.doc.data()['disable'],
        };
      });
    });
    this.authService.getQ().subscribe((data) => {
      this.cuestionarios = data.map((e) => {
        return {
          id: e.payload.doc.id,
          name: e.payload.doc.data()['title'],
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
        .createOp(formValues[0], formValues[1], formValues[2], this.name)
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

  async createQ() {
    await Swal.mixin({
      title: 'Create new Questionary',
      html:
        '<hr />' +
        '<input id="User" class="swal2-input">' +
        '<select id="inputState" class="form-control"><option selected>Choose...</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select>',
      focusConfirm: false,
      inputPlaceholder: 'Select answer',
      showCancelButton: true,
      progressSteps: ['0', '1', '2', '3', '4', '5'],
      preConfirm: () => {
        return [$('#User').val().toString(), $('#inputState').val().toString()];
      },
    })
      .queue([
        {
          title: 'Questionary title',
          text: 'Do not select an option',
        },
        'Question 1',
        'Question 2',
        'Question 3',
        'Question 4',
        'Question 5',
      ])
      .then((result: any) => {
        if (result.value) {
          this.authService.createQuest({
            title: result.value[0][0],
            q1: result.value[1][0],
            a1: result.value[1][1],
            q2: result.value[2][0],
            a2: result.value[2][1],
            q3: result.value[3][0],
            a3: result.value[3][1],
            q4: result.value[4][0],
            a4: result.value[4][1],
            q5: result.value[5][0],
            a5: result.value[5][1],
          });
        }
      });
  }

  deleteQ(qid: string) {
    this.authService.deleteQ(qid);
  }

  disableOp(id: string) {
    this.authService.disableOp(id);
  }

  enableOp(id: string) {
    this.authService.enableOp(id);
  }
}

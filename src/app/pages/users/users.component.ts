import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  //Variables
  cuestionarios = [];
  company: string = '';
  companyid: string = '';
  name: string = '';
  mail: string = '';
  index: string = '0';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    var id = this.authService.userId;
    this.authService.userData(id).subscribe((data) => {
      this.name = data.payload.data()['nombre'];
      this.mail = data.payload.data()['mail'];
      this.company = data.payload.data()['compName'];
      this.companyid = data.payload.data()['compid'];
      
      this.authService.getQu(this.companyid).subscribe((data) => {
        this.cuestionarios = data.map((e) => {
          return {
            id: e.payload.doc.id,
            name: e.payload.doc.data()['title'],
          };
        });
      });
    });
  }
  async setindex(index: string){
    this.index = index;
  }
  async answer() {
    await Swal.mixin({
      title: 'Questionary',
      html:
        '<hr />' +
        '<select id="inputState" class="form-control"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select>',
      focusConfirm: false,
      confirmButtonText: 'Next &rarr;',
      inputPlaceholder: 'Select answer',
      showCancelButton: true,
      progressSteps: ['1', '2', '3', '4', '5'],
      preConfirm: () => {
        return [$('#inputState').val().toString()];
      },
    })
      .queue([
        {
          title: this.cuestionarios[this.index].id,
          text: 'Do not select an option',
        },
        'Question 2',
        'Question 3',
        'Question 4',
        'Question 5',
      ])
      .then((result: any) => {
        if (result.value) {
          this.authService.createanswer(this.companyid, {
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


}

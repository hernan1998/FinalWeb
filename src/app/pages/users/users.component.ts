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
            question: [
              e.payload.doc.data()['q1'],
              e.payload.doc.data()['q2'],
              e.payload.doc.data()['q3'],
              e.payload.doc.data()['q4'],
              e.payload.doc.data()['q5'],
            ],
            answers: {
              a1: e.payload.doc.data()['a1'],
              a2: e.payload.doc.data()['a2'],
              a3: e.payload.doc.data()['a3'],
              a4: e.payload.doc.data()['a4'],
              a5: e.payload.doc.data()['a5'],
            },
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
        '<h3 class="border-bottom border-gray pb-2 mb-0"></h3>' +
        '<select id="inputState" class="form-control"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select>',
      focusConfirm: false,
      confirmButtonText: 'Next &rarr;',
      inputPlaceholder: 'Select answer',
      showCancelButton: true,
      progressSteps: ['1', '2', '3', '4', '5'],
      onBeforeOpen: () => {
          const content = Swal.getContent();
          if (content) {
            const question = content.querySelector('h3');
            if (question) {
              const p = Swal.getProgressSteps();
              const test = p.querySelector('.swal2-active-progress-step');
              question.textContent = this.cuestionarios[this.index].question[parseInt(test.textContent)-1];
            }
          }
        },
      preConfirm: () => {
        return [$('#inputState').val().toString()];
      },
    })
      .queue([
        {
          title: 'Question 1',
          text: 'Do not select an option',
        },
        'Question 2',
        'Question 3',
        'Question 4',
        'Question 5',
      ])
      .then((result: any) => {
        if (result.value) {
          this.authService.createanswer(this.cuestionarios[this.index].id, {
            title: this.cuestionarios[this.index].name,
            q1: this.cuestionarios[this.index].question[0],
            a1: result.value[0][0],
            ac1: 'false',
            q2: this.cuestionarios[this.index].question[1],
            a2: result.value[1][0],
            ac2: 'false',
            q3: this.cuestionarios[this.index].question[2],
            a3: result.value[2][0],
            ac3: 'false',
            q4: this.cuestionarios[this.index].question[3],
            a4: result.value[3][0],
            ac4: 'false',
            q5: this.cuestionarios[this.index].question[4],
            a5: result.value[4][0],
            ac5: 'false',
          });
        }
      });
  }


}

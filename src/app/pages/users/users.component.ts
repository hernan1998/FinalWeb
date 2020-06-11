import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  //Variables
  cuestionarios = [];
  company: string = '';
  companyid: string = '';
  name: string = '';
  mail: string = '';
  index: string = '0';
  ac = [];
  acans = [];
  tfans: boolean;
  ansindex: any = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const id = this.authService.userId;
    this.authService.userData(id).subscribe((data) => {
      this.name = data.payload.data()['nombre'];
      this.mail = data.payload.data()['mail'];
      this.company = data.payload.data()['companyName'];
      this.companyid = data.payload.data()['companyId'];
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
            answers: [
              e.payload.doc.data()['a1'],
              e.payload.doc.data()['a2'],
              e.payload.doc.data()['a3'],
              e.payload.doc.data()['a4'],
              e.payload.doc.data()['a5'],
            ],
          };
        });
      });
      this.authService.getans(id).subscribe((data) => {
        this.ac = data.map((e) => {
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
            answers: [
              e.payload.doc.data()['a1'],
              e.payload.doc.data()['a2'],
              e.payload.doc.data()['a3'],
              e.payload.doc.data()['a4'],
              e.payload.doc.data()['a5'],
            ],
            ans: [
              e.payload.doc.data()['ac1'],
              e.payload.doc.data()['ac2'],
              e.payload.doc.data()['ac3'],
              e.payload.doc.data()['ac4'],
              e.payload.doc.data()['ac5'],
            ],
          };
        });
      });
    });
  }
respuesta(index: string): boolean{
        // console.log(this.cuestionarios[index].id + '       hola');
        // tslint:disable-next-line:prefer-for-of
        for (let index1 = 0; index1 < this.ac.length; index1++) {
          // console.log(index1 + ' ' + this.ac.length);
          // console.log(this.ac[index1].id + '     hola2');
          if (this.cuestionarios[index].id === this.ac[index1].id) {
            // console.log(index + ' '  + '' + index1 + 'hola3');
            return false;
          } else {
            // console.log(index + ' '  + '' + index1 + 'hola4');
            return true;
          }
        }
  }

  async setindex(index: string) {
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
            question.textContent = this.cuestionarios[this.index].question[
              parseInt(test.textContent) - 1
            ];
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
          for (let index = 0; index < 5; index++) {
            if (result.value[index][0] === this.cuestionarios[this.index].answers[index]) {
              this.acans.push('success');
            } else {
              this.acans.push('error');
            }
          }
          console.log(this.ac);


          this.authService.createanswer(this.cuestionarios[this.index].id, {
            title: this.cuestionarios[this.index].name,
            q1: this.cuestionarios[this.index].question[0],
            a1: result.value[0][0],
            ac1: this.acans[0],
            q2: this.cuestionarios[this.index].question[1],
            a2: result.value[1][0],
            ac2: this.acans[1],
            q3: this.cuestionarios[this.index].question[2],
            a3: result.value[2][0],
            ac3: this.acans[2],
            q4: this.cuestionarios[this.index].question[3],
            a4: result.value[3][0],
            ac4: this.acans[3],
            q5: this.cuestionarios[this.index].question[4],
            a5: result.value[4][0],
            ac5: this.acans[4],
          });
        }
      });
  }
  async ans() {
    await Swal.mixin({
      title: 'Questionary',
      html:
        '<hr />' +
        '<h3 class="border-bottom border-gray pb-2 mb-0"></h3>',
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
            question.textContent = this.cuestionarios[this.index].question[
              parseInt(test.textContent) - 1
            ];
            this.ansindex = parseInt(test.textContent) - 1;
            
          }
        }
      },
      preConfirm: () => {
        //const h = Swal.qu;

        //console.log(h);
      },
    })
    .queue([
      {
        title: 'Question 1',
        text: 'Do not select an option',
        icon: this.ac[this.index].ans[0],
      },
      {
        title: 'Question 2',
        icon: this.ac[this.index].ans[1],
      },
      {
        title: 'Question 3',
        icon: this.ac[this.index].ans[2],
      },
      {
        title: 'Question 4',
        icon: this.ac[this.index].ans[3],
      },
      {
        title: 'Question 5',
        icon: this.ac[this.index].ans[4],
      },
    ]);
  }
}

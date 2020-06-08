import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: User;
  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    public database: AngularFireDatabase,
    private firestore: AngularFirestore
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('uid', JSON.stringify(this.user.uid));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  async login(email: string, password: string) {
    var result = await this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        console.log('logged');
        console.log('id:' + data.user.uid);
        this.firestore
          .collection('users')
          .doc(data.user.uid)
          .get()
          .subscribe((doc) => {
            var type = doc.data()['admin'];
            if (type == '1') {
              Swal.fire('Success', 'Valid user', 'success').then(() => {
                this.router.navigate(['home']);
              });
            } else {
              if (type == '0') {
                this.firestore
                  .collection('users')
                  .doc(data.user.uid)
                  .get()
                  .subscribe((doc1) => {
                    var disable = doc1.data()['disable'];
                    if (!disable) {
                      Swal.fire('Success', 'Valid user', 'success').then(() => {
                        this.router.navigate(['user']);
                      });
                    } else {
                      Swal.fire('Error', 'User Disable', 'error').then(() => {
                        this.logout();
                      });
                    }
                  });
              }
            }
          });
      })
      .catch((Error) => {
        throw Error;
      });
  }

  async register(
    name: string,
    cc: string,
    email: string,
    company: string,
    password: string
  ) {
    var result = await this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        console.log(data.user.uid);
        this.firestore
          .collection('users')
          .doc(data.user.uid)
          .set({
            nombre: name,
            mail: email,
            pass: password,
            cedula: cc,
            compName: company,
            admin: '1',
          })
          .catch((Error) => {
            console.log(Error);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  async createOp(name: string, email: string, password: string) {
    const id = JSON.parse(localStorage.getItem('uid'));
    await this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.firestore.collection('users').doc(data.user.uid).set({
          nombre: name,
          mail: email,
          pass: password,
          admin: '0',
          disable: false,
        });
        this.firestore
          .collection('users')
          .doc(id)
          .collection('operadores')
          .doc(data.user.uid)
          .set({
            nombre: name,
            mail: email,
            pass: password,
            disable: false,
          });
      });
  }

  createQuest(data: {
    title: any;
    q1: any;
    a1: any;
    q2: any;
    a2: any;
    q3: any;
    a3: any;
    q4: any;
    a4: any;
    q5: any;
    a5: any;
  }) {
    return this.firestore
      .collection('users')
      .doc(this.userId)
      .collection('cuestionarios')
      .add(data)
      .then(() => {
        Swal.fire('Success', 'Questionary created', 'success');
      })
      .catch((e) => {
        Swal.fire('Error', e, 'error');
      });
  }

  createanswer(id: string, data: {
    title: any;
    q1: any;
    a1: any;
    q2: any;
    a2: any;
    q3: any;
    a3: any;
    q4: any;
    a4: any;
    q5: any;
    a5: any;
  }) {
    return this.firestore
      .collection('users')
      .doc(id)
      .collection('cuestionarios')
      .add(data)
      .then(() => {
        Swal.fire('Success', 'Questionary created', 'success');
      })
      .catch((e) => {
        Swal.fire('Error', e, 'error');
      });
  }

  async disableOp(uid: string) {
    await this.firestore
      .collection('users')
      .doc(uid)
      .update({
        disable: true,
      })
      .then(() => {
        this.firestore
          .collection('users')
          .doc(this.userId)
          .collection('operadores')
          .doc(uid)
          .update({
            disable: true,
          });
      });
  }

  async enableOp(uid: string) {
    await this.firestore
      .collection('users')
      .doc(uid)
      .update({
        disable: false,
      })
      .then(() => {
        this.firestore
          .collection('users')
          .doc(this.userId)
          .collection('operadores')
          .doc(uid)
          .update({
            disable: false,
          });
      });
  }

  getOps() {
    return this.firestore
      .collection('users')
      .doc(this.userId)
      .collection('operadores')
      .snapshotChanges();
  }

  getQ() {
    return this.firestore
      .collection('users')
      .doc(this.userId)
      .collection('cuestionarios')
      .snapshotChanges();
  }

  getQu(id: string) {

    return this.firestore
      .collection('users')
      .doc(id)
      .collection('cuestionarios')
      .snapshotChanges();
  }

  deleteQ(id: string) {
    return this.firestore
      .collection('users')
      .doc(this.userId)
      .collection('cuestionarios')
      .doc(id)
      .delete();
  }

  async logout() {
    await this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  get userId(): string {
    const id = JSON.parse(localStorage.getItem('uid'));
    return id;
  }

  userData(id: string) {
    return this.firestore.collection('users').doc(id).snapshotChanges();
  }
}

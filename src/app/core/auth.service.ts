import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

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

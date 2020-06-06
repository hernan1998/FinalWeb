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
    console.log('Entro');
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
    email: string,
    password: string,
    name: string,
    cc: string,
    phone: string,
    dirc: string
  ) {
    var result = await this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        this.firestore
          .collection('users')
          .doc(data.user.uid)
          .set({
            nombre: name,
            mail: email,
            pass: password,
            cedula: cc,
            telefono: phone,
            dir: dirc,
          })
          .then(() => {
            //this.router.navigate(['perfil']);
          })
          .catch((Error) => {
            console.log(Error);
          });
      });
  }

  createPost(data: { title: any; body: any; id: any; date: any }) {
    return this.firestore
      .collection('post')
      .add(data)
      .then(() => {
        console.log('Post agregado');
      })
      .catch(() => {
        console.log('Error agregar post');
      });
  }

  getPosts() {
    return this.firestore.collection('post').snapshotChanges();
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

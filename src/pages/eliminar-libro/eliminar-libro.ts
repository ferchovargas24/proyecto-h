import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import firebase from 'firebase';


@IonicPage()
@Component({
  selector: 'page-eliminar-libro',
  templateUrl: 'eliminar-libro.html',
})
export class EliminarLibroPage {

  public usuRef: firebase.database.Reference = firebase.database().ref('/administradores');
  public libroRef: firebase.database.Reference = firebase.database().ref('/libros');
  email: string;
  misLibros: Array<any> = [];
  usuarios: Array<any> = [];
  idUsuarioLibro;
  currentUser;
  isEnabled: boolean =false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private mensaje: ToastController) {

  }

  ionViewDidLoad() {

    this.mostrarUsuarios();
  }

  habilitaBoton(){
    this.isEnabled=true;
  }

  mostrarUsuarios() {


    this.usuRef.on('value', usuarioSnapshot => {
      this.usuarios = [];
      usuarioSnapshot.forEach(usuSnap => {
        if (usuSnap.val().admin == 0) {
          this.usuarios.push(usuSnap.val().email)
        }
        return false;
      });
    });

  }

  librosDelUsuario(usuario) {

    console.log(usuario)
    var idUsuario;
    this.currentUser = usuario;
    this.usuRef.on('value', usuarioSnapshot => {
      this.misLibros = [];
      usuarioSnapshot.forEach(usuSnap => {
        if (usuario == usuSnap.val().email) {
          idUsuario = usuSnap.key
        }
        return false;
      });
    });
    this.idUsuarioLibro = idUsuario;
    const usuarioReference: firebase.database.Reference = firebase.database().ref(`/administradores/` + idUsuario + '/misLibros');

    usuarioReference.on('value', libroSnapshot => {
      this.misLibros = [];
      libroSnapshot.forEach(libroSnap => {
        this.misLibros.push(libroSnap.val().tituloPedido);
        return false;
      });
    });

    console.log(this.misLibros)
  }

  eliminarLibro(libro) {

    const usuarioReference: firebase.database.Reference = firebase.database().ref(`/administradores/` + this.idUsuarioLibro + '/misLibros');
    var libroId;
    var cantidad;
    var idLibroActualizar;
    usuarioReference.on('value', libroSnapshot => {
      libroSnapshot.forEach(libroSnap => {
        if (libro == libroSnap.val().tituloPedido) {
          libroId = libroSnap.key;
        }
        return false;
      });
    });

    usuarioReference.child(libroId).remove();
    this.mensaje.create({
      message: "Libro entregado, gracias",
      duration: 3000
    }).present();
    this.libroRef.on('value', libroSnapshot => {
      libroSnapshot.forEach(libroSnap => {

        if (libro == libroSnap.val().titulo) {
          idLibroActualizar = libroSnap.key;

          cantidad = libroSnap.val().cantidad;
        }
        return false;
      });
    });

    setTimeout(() => {

      cantidad = (cantidad + 1);
      const libroReference: firebase.database.Reference = firebase.database().ref(`/libros/` + idLibroActualizar);
      libroReference.update({
        cantidad
      });
    }, 1000);


    this.librosDelUsuario(this.currentUser);

  }
}

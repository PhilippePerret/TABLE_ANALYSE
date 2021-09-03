/**
 * CLass InterconnectClass (const Interconnexion)
 * 
 * Pour intercommuniquer avec les autres fenêtres (iframe) pour 
 * outrepasser la limite de same-origin.
 * 
 * 
 * Ce module doit se trouver des deux côtés.
 * 
 * On instancie une interconnexion avec :
 * 
 *    const inter = new Interconnexion({name:'A <-> B', other:iframe})
 *    * CET IDENTIFIANT :name DOIT ÊTRE LE MÊME DES DEUX CÔTÉS
 *    // La méthode qui va traiter les retours/réception
 *    inter.onReceive = function(data){
 *      // ... traitement de +data+ ....   
 *    }
 * 
 * On fait la même chose de l'autre côté.
 * 
 * On envoie un message avec :
 * 
 *    inter.send({data})
 * 
 * +{data}+ peut-être n'importe quoi, en fonction de l'utilisation.
 * Noter que si deux noms différents ont été choisis de chaque côté
 * au lieu d'un seul comme c'est conseillé, il faut impérativement
 * que +data+ définisse la clé :name avec le nom de l'interconnexion
 * de l'autre côté.
 * 
 */
class Interconnexion {

  /**
   * Pour pouvoir recevoir des messages de la part des autres
   * 
   * Cette méthode est commune à toutes les interconnexion. Il faut 
   * donc un identifiant permettant d'identifier l'expéditeur. On le
   * met dans :other
   * 
   *
   */
  static onMessage(e){
    const data = e.data
    // console.log("Interconnexion.items['%s'] : ", data.name, this.items)
    // console.log("this.items[data.name] = ", this.items[data.name], typeof(this.items[data.name]))
    this.items[data.name].receive(data)
  }

  static add(conn){
    this.items || (this.items = {})
    Object.assign(this.items, {[conn.name]: conn})
  }

  constructor(data){
    this.name   = data.name ; // p.e. "Interconnexion avec Staves"
    this.other  = data.other ; // Objet DOM de l'auteur
    this.constructor.add(this)
  }

  /**
   * Envoyer des données de l'autre côté
   * 
   */
  send(data){
    Object.assign(data, {name:this.name})
    // this.other.postMessage(data)
    UI.panneauStave.contentWindow.postMessage(data,'*')
  }

  /**
   * Recevoir des données de l'autre côté
   * 
   */
  receive(data){

  }


}

window.addEventListener('message', Interconnexion.onMessage.bind(Interconnexion), false);

/* 
 * In the following example, the API is used to access a "registro" database that
 * holds alumnos stored by their "cedula" attribute.
 * An index is maintained on the "apellido" attribute of the objects, and can be used to look up alumnos by apellido.
 * A connection to the database is opened. If the "registro" database did not already
 * exist, it is created and an event handler creates the object store and indexes. 
 * Finally, the opened connection is saved for use.
 */
//Cargar la variable global y crossbrowser (para todos los navegadores)
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

var dataBase = null;

//inicializar la base de datos
function startDB() {
    //“conector” abierto a nuestra base de datos.
    //dataBase = indexedDB.open("Nombre de la base de datos", "Versión de la base de datos"); la versión es opcional
    
    dataBase = indexedDB.open('registro', 1);//abre la base de datos, si no existe, crea una con versión = 0
    
    dataBase.onupgradeneeded = function (e) {
        var activeDB = dataBase.result;
        
        var registro = activeDB.createObjectStore("alumnos", {keyPath: 'id', autoIncrement: true}); //crea la colección (tabla) alumnos con una propiedad (columna) id que será la clave primaria y autoincrementado
        registro.createIndex('by_cedula', 'ci', {unique: true}); // crea un indice (by_cedula) de la propiedad cédula (cedula) que es único ({unique: true})
        registro.createIndex('by_nombre', 'name', {unique: false}); //crea un indice de la propiedad nombre
    };
    //control del resultado
    dataBase.onsuccess = function (e) {//cuando la conexión se haya realizado correctamente, sin producirse ningún error. Se lanza después del método onupgradeneeded.
        console.log("Database loaded successfuly");
    };
    dataBase.onerror = function (e) {//Se ejecutará cuando falle el open()… ya sea por un fallo en la apertura en sí como por algún error en el método onupgradeneeded.
        console.log("Database not loaded");
    };
}
function addToIndexedDB() {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");

    var request = object.put({
        ci: document.querySelector("#FormControlNumerodecedula").value,
        name: document.querySelector("#FormControlNombre").value,
        surname: document.querySelector("#FormControlApellido").value
    });

    request.onerror = function (e) {
        console.log(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = function (e) {
        console.log('Objeto agregado correctamente');
    };
}


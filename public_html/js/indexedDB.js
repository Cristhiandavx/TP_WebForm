/* 
 * In the following example, the API is used to access a "registro" database that
 * holds alumnos stored by their "cedula" attribute.
 * An index is maintained on the "apellido" attribute of the objects, and can be used to look up alumnos by apellido.
 * A connection to the database is opened. If the "registro" database did not already
 * exist, it is created and an event handler creates the object store and indexes. 
 * Finally, the opened connection is saved for use.
 
 Author     : Cristhian
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
        registro.createIndex('by_ci', 'ci', {unique: true}); // crea un indice (by_cedula) de la propiedad cédula (cedula) que es único ({unique: true})
        registro.createIndex('by_nombre', 'nombre', {unique: false}); //crea un indice de la propiedad nombre
    };
    //control del resultado
    dataBase.onsuccess = function (e) {//cuando la conexión se haya realizado correctamente, sin producirse ningún error. Se lanza después del método onupgradeneeded.
        console.log("Database loaded successfuly");
        console.log("DB name: " + dataBase.result.name);
        console.log("DB version: " + dataBase.result.version);
    };
    dataBase.onerror = function (e) {//Se ejecutará cuando falle el open()… ya sea por un fallo en la apertura en sí como por algún error en el método onupgradeneeded.
        console.log("Database not loaded");
        console.log(dataBase.error.name + '\n\n' + dataBase.error.message);
    };
}
function addToIndexedDB() {
    var activeDB = dataBase.result;
    var data = activeDB.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");

    var request = object.put({
        ci: document.querySelector("#FormControlNumerodecedula").value,
        nombre: document.querySelector("#FormControlNombre").value,
        apellido: document.querySelector("#FormControlApellido").value
    });

    request.onerror = function (e) {
        console.log(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = function (e) {
        console.log('Objeto agregado correctamente');
        loadAll();
    };
}
function load(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");

    var request = object.get(parseInt(id));

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                               C.I. Nº: " + result.ci + "\n\
                               Nombre: " + result.nombre + "\n\
                               Apellido: " + result.apellido);
        }
    };
}

function loadByDni(ci) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");
    var index = object.index("by_ci");
    var request = index.get(String(ci));

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                               C.I. Nº: " + result.ci + "\n\
                               Nombre: " + result.nombre + "\n\
                               Apellido: " + result.apellido);
        }
    };
}

function loadAll() {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");

    var elements = [];

    object.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null) {
            return;
        }

        elements.push(result.value);
        result.continue();

    };

    data.oncomplete = function () {

        var outerHTML = '';

        for (var key in elements) {

            outerHTML += '\n\
                        <tr>\n\
                            <td>' + elements[key].ci + '</td>\n\
                            <td>' + elements[key].nombre + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="load(' + elements[key].id + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="loadByDni(' + elements[key].ci + ')">Detalles por C.I.</button>\n\
                                <button type="button" onclick="delByDni(' + elements[key].id + ')">Eliminar registro</button>\n\
                                <button type="button" onclick="loadAllByName()">Ordenar por nombre</button>\n\
                            </td>\n\
                        </tr>';

        }

        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
        console.log("Actual Object Store Name: " + active.name);
        document.querySelector("#db_objectsName").innerHTML = "Nombre de la tabla: " + active.name;
    };
}

function loadAllByName() {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");
    var index = object.index("by_nombre");

    var elements = [];

    index.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null) {
            return;
        }

        elements.push(result.value);
        result.continue();

    };

    data.oncomplete = function () {

        var outerHTML = '';

        for (var key in elements) {

            outerHTML += '\n\
                        <tr>\n\
                            <td>' + elements[key].ci + '</td>\n\
                            <td>' + elements[key].nombre + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="load(' + elements[key].id + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="loadByDni(' + elements[key].ci + ')">Detalles por C.I.</button>\n\
                                <button type="button" onclick="delByDni(' + elements[key].id + ')">Eliminar registro</button>\n\
                                <button type="button" onclick="loadAllByName()">Ordenar por nombre</button>\n\
                            </td>\n\
                        </tr>';

        }

        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
function delByDni(ci) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    var request = object.delete(ci);//borrar dato

    request.onsuccess = function () {
        console.log("success");
        loadAll();
    };
}
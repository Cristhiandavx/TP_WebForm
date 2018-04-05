/* 
 * In the following example, the API is used to access a "registro" database that
 * holds alumnos stored by their "cedula" attribute.
 * An index is maintained on the "apellido" attribute of the objects, and can be used to look up alumnos by apellido.
 * A connection to the database is opened. If the "registro" database did not already
 * exist, it is created and an event handler creates the object store and indexes. 
 * Finally, the opened connection is saved for use.
 */
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

var dataBase = null;

function startDB() {

    dataBase = indexedDB.open('object', 1);

    dataBase.onupgradeneeded = function (e) {
        var active = dataBase.result;

        var object = active.createObjectStore("people", {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_name', 'name', {unique: false});
        object.createIndex('by_dni', 'dni', {unique: true});
    };

    dataBase.onsuccess = function (e) {
        console.log('Database loaded');
    };
    dataBase.onerror = function (e) {
        console.log('Error loading database');
    };
}

function addToIndexedDB() {

    var active = dataBase.result;
    var data = active.transaction(["people"], "readwrite");
    var object = data.objectStore("people");

    var request = object.put({
        dni: document.querySelector("#FormControlNumerodecedula").value,
        name: document.querySelector("#FormControlNombre").value,
        surname: document.querySelector("#FormControlApellido").value
    });

    request.onerror = function (e) {
        console.log(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = function (e) {

        console.log('Object successfully added');
    };
}
function loadAll() {

    var active = dataBase.result;
    var data = active.transaction(["people"], "readonly");
    var object = data.objectStore("people");

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
                            <td>' + elements[key].dni + '</td>\n\
                            <td>' + elements[key].name + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="load(' + elements[key].id + ')">Details</button>\n\
                            </td>\n\
                        </tr>';

        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
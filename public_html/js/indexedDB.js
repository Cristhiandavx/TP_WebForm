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
    dataBase = indexedDB.open('registro', 1);//abre la base de datos con ese nombre, si no existe, crea una con versión = 1

    dataBase.onupgradeneeded = function (e) {
        var activeDB = dataBase.result;
        var registro = activeDB.createObjectStore("alumnos", {keyPath: 'id_alumno', autoIncrement: true}); //crea la colección (tabla) alumnos con una propiedad (columna) id que será la clave primaria y autoincrementado
        //indices createIndex('nombre del indice', 'nombre del registro', {constraints: true/false});
        registro.createIndex('id_alumno', 'id_alumno', {unique: true}); //crea un indice de la propiedad id
        registro.createIndex('ci_alumno', 'ci_alumno', {unique: true}); // crea un indice (by_cedula) de la propiedad cédula (cedula) que es único ({unique: true})
        registro.createIndex('nombre_alumno', 'nombre_alumno', {unique: false}); //crea un indice de la propiedad nombre
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
function addRecord() {
    var activeDB = dataBase.result;
    var data = activeDB.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");

    var request = object.add({
        ci_alumno: document.querySelector("#FormControlNumerodecedula").value,
        nombre_alumno: document.querySelector("#FormControlNombre").value,
        apellido_alumno: document.querySelector("#FormControlApellido").value
    });
    request.onerror = function (e) {
        console.log(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = function (e) {
        document.querySelector("form").reset();
        loadAllRecords();
    };
}
function modifyRecord(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    var index = object.index('id_alumno');

    index.openCursor(id).onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            var updateData = cursor.value;
            updateData.nombre_alumno = document.querySelector("#FormControlNombre").value;
            updateData.apellido_alumno = document.querySelector("#FormControlApellido").value;
            var request = cursor.update(updateData);
            request.onsuccess = function () {
                console.log('Modificado');
                loadAllRecords();
                document.querySelector("form").reset();
            };
            request.onerror = function () {
                console.log('Error' + '/n/n' + request.error.name + '\n\n' + request.error.message);
                loadAllRecords();
            };
        }
    };
}
function deleteRecord(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    var request = object.delete(id);//borrar registro(key)

    request.onsuccess = function () {
        console.log("success");
        loadAllRecords();
    };

}
function loadAllRecords() {
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
                        <tr onclick="loadToForm(' + elements[key].id_alumno + ')">\n\
                            <td>' + elements[key].ci_alumno + '</td>\n\
                            <td>' + elements[key].nombre_alumno + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="loadRecordData(' + elements[key].id_alumno + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="deleteRecord(' + elements[key].id_alumno + ')">Eliminar registro</button>\n\
                            </td>\n\
                        </tr>';
        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
        console.log("Actual Object Store Name: " + active.name);
        document.querySelector("#db_objectsName").innerHTML = "Nombre de la tabla: " + active.name;
        //document.querySelector("#btn_loadAll").hide();
        document.querySelector("#btn_orderByName").classList.remove("d-none");

    };
}
function loadRecordData(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");

    var request = object.get(parseInt(id));

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                               C.I. Nº: " + result.ci_alumno + "\n\
                               Nombre: " + result.nombre_alumno + "\n\
                               Apellido: " + result.apellido_alumno);
        }
    };
}
function loadRecordDataByCi() {
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
        var jo = 0;
        for (var key in elements) {
            var ci = elements[key].ci_alumno;
            if(ci === $("#FormControlNumerodecedula").val()){
                alert("Se ha encontrado un registro con el mismo Nº de cédula. Cargando los datos");
                if(jo === 0){
                    loadToForm(elements[key].id_alumno);
                } else {
                    jo = 1;
                }
            }
        }
        elements = [];
    };
}
function loadToForm(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");
    var index = object.index("id_alumno");
    var request = index.get(id);

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            document.querySelector("#FormControlNumerodecedula").value = result.ci_alumno;
            document.querySelector("#FormControlNombre").value = result.nombre_alumno;
            document.querySelector("#FormControlApellido").value = result.apellido_alumno;
            document.querySelector("#FormControlNombre").focus();
        }
        document.querySelector("#btnGuardar").classList.add("d-none");
        document.querySelector("#btnModificar").classList.remove("d-none");
        $("#btnModificar").attr('onclick', 'modifyRecord(' + id + ')');

    };
}
function orderByName() {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readonly");
    var object = data.objectStore("alumnos");
    var index = object.index("nombre_alumno");
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
                        <tr onclick="loadToForm(' + elements[key].ci_alumno + ')">\n\
                            <td>' + elements[key].ci_alumno + '</td>\n\
                            <td>' + elements[key].nombre_alumno + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="loadRecordData(' + elements[key].id_alumno + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="deleteRecord(' + elements[key].id_alumno + ')">Eliminar registro</button>\n\
                            </td>\n\
                        </tr>';

        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
function verifyAction() {
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
        //cargar la base de datos y comparar con el que se está cargando
        for (var key in elements) {
            //recorrer los registros mediante "key"
        }
        elements = [];
        
    };
}
/* 
 Author     : Cristhian
 */
/*Obs.: Los comentarios para una línea los pongo por encima de ella. Es decir, cada comentario está por encima de la línea de codigo a ser comentada */
//=====================INDEXED DATA BASE (Copied from examples in documentation site of IndexedDB)=================================//
/*
 * In the following example, the API is used to access a database (indexedDB) that
 * holds objects (IDBOject) stored by their named attribute.
 * An index is maintained on the attribute of the objects, and can be used to look up objects by the attribute index name.
 * A connection to the database is opened. If the database did not already
 * exist, it is created and an event handler creates the object store and indexes. 
 * Finally, the opened connection is saved for use.
 * 
 */
//codigo para la utilización de variables de IndexedDB
// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
var dataBase = null;//inicializa una variable global
//abrir la base de datos, si no existe, crea una.
function startDB() {
    //sintax used: dataBase = indexedDB.open("Nombre de la base de datos", "Versión de la base de datos"); la versión es opcional
    dataBase = indexedDB.open('registro', 1);//abre la base de datos con ese nombre, si no existe, crea una con versión = 1
    dataBase.onupgradeneeded = function (e) {
        var activeDB = dataBase.result;
        //crea la colección (tabla) alumnos con un atributo (columna) id que será la clave primaria y autoincrementado de los objetos (filas) guardados en cada registro
        var registro = activeDB.createObjectStore("alumnos", {keyPath: 'id_alumno', autoIncrement: true});
        //indices createIndex('nombre del indice', 'nombre del registro', {constraints: true/false});
        registro.createIndex('id_alumno', 'id_alumno', {unique: true}); //crea un indice para el atributo id
        registro.createIndex('ci_alumno', 'ci_alumno', {unique: true}); //aplica una restringción para que sea único ({unique: true})
        registro.createIndex('nombre_alumno', 'nombre_alumno');
    };
    //control del resultado
    dataBase.onsuccess = function (e) {//cuando la conexión se haya realizado correctamente, sin producirse ningún error. Se lanza después del método onupgradeneeded.
        console.log("Database loaded successfuly");
        console.log("DB name: " + dataBase.result.name);
        console.log("DB version: " + dataBase.result.version);
        console.log("Actual Object Store Name: " + dataBase.result.name);
        document.querySelector("#db_objectsName").innerHTML = "Nombre de la tabla: " + dataBase.result.name;
    };
    dataBase.onerror = function (e) {//Se ejecutará cuando falle el open()… ya sea por un fallo en la apertura en sí como por algún error en el método onupgradeneeded.
        console.log("Database not loaded");
        console.log(dataBase.error.name + '\n' + dataBase.error.message);
    };
}
//guardar registro mediante add({value/values})
function addRecord() {
    var activeDB = dataBase.result;
    var data = activeDB.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    //para los valores de los checkbox
    var ViveconCheck = document.querySelectorAll("[name='FormCheckVivecon']:checked");
    var i;
    var FormCheckViveconValues = [];
    for (i = 0; i < ViveconCheck.length; i++) {
        val = ViveconCheck[i].value;
        FormCheckViveconValues[i] = val;
    }
    var request = object.add({
        ci_alumno: document.querySelector("#FormControlNumerodecedula").value,
        nombre_alumno: document.querySelector("#FormControlNombre").value,
        apellido_alumno: document.querySelector("#FormControlApellido").value,
        fechadenac_alumno: document.querySelector("#FormDateFechadenac").value,
        paisdenac_alumno: document.querySelector("#FormControlSelectPaisdenac").value, //está con números (1=españa, 2=portugal, ...etc)
        nacionalidad_alumno: document.querySelector("#FormControlNacionalidad").value,
        estadocivil_alumno: document.querySelector("[name=RadioOption-inlEstadocivil]:checked").value,
        vivecon_alumno: FormCheckViveconValues,
        direccion_alumno: document.querySelector("#FormControlDireccion").value,
        telefono_alumno: document.querySelector("#FormControlTelefono").value,
        email_alumno: document.querySelector("#FormControlEmail").value,
        gradoprim_alumno: document.querySelector("[name=RadioOption-inlGradoPrim]").value,
        institucionprim_alumno: document.querySelector("#FormControlPrimaria").value,
        primdesde_alumno: document.querySelector("#FormControlPeriodoDesdePrim").value,
        primhasta_alumno: document.querySelector("#FormControlPeriodoHastaPrim").value,
        gradosec_alumno: document.querySelector("[name=RadioOption-inlGradoSec]").value,
        institucionsec_alumno: document.querySelector("#FormControlSecundaria").value,
        secdesde_alumno: document.querySelector("#FormControlPeriodoDesdeSec").value,
        sechasta_alumno: document.querySelector("#FormControlPeriodoHastaSec").value,
        gradouniv_alumno: document.querySelector("[name=RadioOption-inlGradoUniv]").value,
        institucionuniv_alumno: document.querySelector("#FormControlUniversitaria").value,
        univdesde_alumno: document.querySelector("#FormControlPeriodoDesdeUniv").value,
        univhasta_alumno: document.querySelector("#FormControlPeriodoHastaUniv").value
    });
    request.onerror = function (e) {
        console.log(request.error.name + '\n' + request.error.message);
    };
    data.oncomplete = function (e) {
        console.log("added");
        document.querySelector("form").reset();
        loadAllRecords();
    };
}
//modificar registro mediante: index.openCursor(valor de indice) y target.result.update(valores nuevos)
function modifyRecord(ci) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    var index = object.index('ci_alumno');

    var ViveconCheck = document.querySelectorAll("[name='FormCheckVivecon']:checked");
    var i;
    var FormCheckViveconValues = [];
    for (i = 0; i < ViveconCheck.length; i++) {
        val = ViveconCheck[i].value;
        FormCheckViveconValues[i] = val;
    }
    index.openCursor(ci).onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            var updateData = cursor.value;
            updateData.ci_alumno = document.querySelector("#FormControlNumerodecedula").value;
            updateData.nombre_alumno = document.querySelector("#FormControlNombre").value;
            updateData.apellido_alumno = document.querySelector("#FormControlApellido").value;
            updateData.fechadenac_alumno = document.querySelector("#FormDateFechadenac").value;
            updateData.paisdenac_alumno = document.querySelector("#FormControlSelectPaisdenac").value; //está con números (1=españa, 2=portugal, ...etc)
            updateData.nacionalidad_alumno = document.querySelector("#FormControlNacionalidad").value;
            updateData.estadocivil_alumno = document.querySelector("[name=RadioOption-inlEstadocivil]:checked").value;
            updateData.vivecon_alumno = FormCheckViveconValues;
            updateData.direccion_alumno = document.querySelector("#FormControlDireccion").value;
            updateData.telefono_alumno = document.querySelector("#FormControlTelefono").value;
            updateData.email_alumno = document.querySelector("#FormControlEmail").value;
            updateData.gradoprim_alumno = document.querySelector("[name=RadioOption-inlGradoPrim]").value;
            updateData.institucionprim_alumno = document.querySelector("#FormControlPrimaria").value;
            updateData.primdesde_alumno = document.querySelector("#FormControlPeriodoDesdePrim").value;
            updateData.primhasta_alumno = document.querySelector("#FormControlPeriodoHastaPrim").value;
            updateData.gradosec_alumno = document.querySelector("[name=RadioOption-inlGradoSec]").value;
            updateData.institucionsec_alumno = document.querySelector("#FormControlSecundaria").value;
            updateData.secdesde_alumno = document.querySelector("#FormControlPeriodoDesdeSec").value;
            updateData.sechasta_alumno = document.querySelector("#FormControlPeriodoHastaSec").value;
            updateData.gradouniv_alumno = document.querySelector("[name=RadioOption-inlGradoUniv]").value;
            updateData.institucionuniv_alumno = document.querySelector("#FormControlUniversitaria").value;
            updateData.univdesde_alumno = document.querySelector("#FormControlPeriodoDesdeUniv").value;
            updateData.univhasta_alumno = document.querySelector("#FormControlPeriodoHastaUniv").value;
            var request = cursor.update(updateData);
            request.onsuccess = function () {
                console.log('Modificado');
                document.querySelector("form").reset();
                loadAllRecords();
            };
            request.onerror = function () {
                console.log('Error' + '/n' + request.error.name + '\n' + request.error.message);
                loadAllRecords();
            };
        }
    };
}
function deleteRecord(id) {
    var active = dataBase.result;
    var data = active.transaction(["alumnos"], "readwrite");
    var object = data.objectStore("alumnos");
    var request = object.delete(id); //borrar registro(key)
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
                        <tr>\n\
                            <td>' + elements[key].ci_alumno + '</td>\n\
                            <td>' + elements[key].nombre_alumno + '</td>\n\
                            <td>' + elements[key].apellido_alumno + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="loadRecordData(' + elements[key].id_alumno + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="deleteRecord(' + elements[key].id_alumno + ')">Eliminar registro</button>\n\
                                <button type="button"  onclick="loadToForm(' + elements[key].id_alumno + ')">Editar registro</button>\n\
                            </td>\n\
                        </tr>';
        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
        console.log("Data loaded from Object Store: " + active.name);
        document.querySelector("#db_objectsName").innerHTML = "Nombre de la tabla: " + active.name;
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
            alert("ID: " + result.id_alumno + "\n\
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
    var jo = 0;
    data.oncomplete = function () {
        for (var key in elements) {
            var ci = elements[key].ci_alumno;
            if (ci === $("#FormControlNumerodecedula").val()) {
                console.log("existing ci_alumno found for id:" + elements[key].id_alumno + ", ci: " + elements[key].ci_alumno);
                document.querySelector("#btnModificar").classList.remove("d-none");
                document.querySelector("#btnGuardar").classList.add("d-none");
                if (jo === 0) {
                    loadToForm(elements[key].id_alumno);
                    console.log("Loading data into forms");
                    jo = 1;
                } else {
                    jo = 0;
                    if ($("#FormControlNumerodecedula").val() === "") {
                        document.querySelector("#btnModificar").classList.add("d-none");
                        document.querySelector("#btnGuardar").classList.remove("d-none");
                    }
                }
            } else {
                document.querySelector("#btnModificar").classList.add("d-none");
                document.querySelector("#btnGuardar").classList.remove("d-none");
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
            document.querySelector("#FormDateFechadenac").value = result.fechadenac_alumno;
            document.querySelector("#FormControlSelectPaisdenac").value; //está con números (1=españa, 2=portugal, ...etc = result.paisdenac_alumno)
            document.querySelector("#FormControlNacionalidad").value = result.nacionalidad_alumno;
            document.querySelector("[name=RadioOption-inlEstadocivil][value=" + result.estadocivil_alumno + "]").checked = true;
            //recorrer el array que llega
            var ViveconArray = result.vivecon_alumno;
            var i;
            var ViveconArrayValues = [];
            for (i = 0; i < ViveconArray.length; i++) {
                ViveconArrayValues = ViveconArray[i];
                document.querySelector("[name='FormCheckVivecon'][value=" + ViveconArrayValues + "]").checked = true;
            }
            document.querySelector("#FormControlDireccion").value = result.direccion_alumno;
            document.querySelector("#FormControlTelefono").value = result.telefono_alumno;
            document.querySelector("#FormControlEmail").value = result.email_alumno;
            document.querySelector("[name=RadioOption-inlGradoPrim][value=" + result.gradoprim_alumno + "]").checked = true;
            document.querySelector("#FormControlPrimaria").value = result.institucionprim_alumno;
            document.querySelector("#FormControlPeriodoDesdePrim").value = result.primdesde_alumno;
            document.querySelector("#FormControlPeriodoHastaPrim").value = result.primhasta_alumno;
            document.querySelector("[name=RadioOption-inlGradoSec][value=" + result.gradosec_alumno + "]").checked = true;
            document.querySelector("#FormControlSecundaria").value = result.institucionsec_alumno;
            document.querySelector("#FormControlPeriodoDesdeSec").value = result.secdesde_alumno;
            document.querySelector("#FormControlPeriodoHastaSec").value = result.sechasta_alumno;
            document.querySelector("[name=RadioOption-inlGradoUniv][value=" + result.gradouniv_alumno + "]").checked = true;
            document.querySelector("#FormControlUniversitaria").value = result.institucionuniv_alumno;
            document.querySelector("#FormControlPeriodoDesdeUniv").value = result.univdesde_alumno;
            document.querySelector("#FormControlPeriodoHastaUniv").value = result.univhasta_alumno;
        }
        document.querySelector("#btnGuardar").classList.add("d-none");
        document.querySelector("#btnModificar").classList.remove("d-none");
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
                        <tr>\n\
                            <td>' + elements[key].ci_alumno + '</td>\n\
                            <td>' + elements[key].nombre_alumno + '</td>\n\
                            <td>' + elements[key].apellido_alumno + '</td>\n\
                            <td>\n\
                                <button type="button" onclick="loadRecordData(' + elements[key].id_alumno + ')">Detalles por registro</button>\n\
                                <button type="button" onclick="deleteRecord(' + elements[key].id_alumno + ')">Eliminar registro</button>\n\
                                <button type="button"  onclick="loadToForm(' + elements[key].id_alumno + ')">Editar registro</button>\n\
                            </td>\n\
                        </tr>';
        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
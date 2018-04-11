/* 
 Created on : 02/04/2018, 12:11:14 PM
 Author     : Cristhian
 
 */

// =========================Validaciones========================================
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    S
                    addToIndexedDB();
                    alert("added");
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// =============================================================================
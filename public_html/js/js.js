/* 
 Created on : 02/04/2018, 12:11:14 PM
 Author     : Cristhian
 
 */

// =========================Validaciones========================================
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function validate() {
    'use strict';

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission after click on OK from alert

        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                    form.classList.add('was-validated');

                } else {
                    //swal("Formulario verificado", "Haga click en Ok para enviar", "success");
                    event.preventDefault();
                    event.stopPropagation();
                    if (addToIndexedDB()) {
                        alert("Saved");
                        form.classList.remove('was-validated');

                    }
                }
            }, false);
        });
    }, false);
})();
// =============================================================================
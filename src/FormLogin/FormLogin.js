import React from "react";

const FormLogin = () => {
    return (
        <form>
            <h3> Iniciar Sesión </h3>
            <label> Username </label>
            <input type="text" />

            <label> Username </label>
            <input type="password" />

            <button> Login </button>
            <h4> - Or continue whit - </h4>
        </form>
    );
};

export default FormLogin;
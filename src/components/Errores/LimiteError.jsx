import { Component } from "react";
import PaginaError from "./PaginaError";

// Red de seguridad: si una página falla al dibujarse, en vez de dejar la pantalla
// en blanco se muestra un mensaje con opciones para recuperarse.
class LimiteError extends Component {
  constructor(props) {
    super(props);
    this.state = { huboError: false };
  }

  static getDerivedStateFromError() {
    return { huboError: true };
  }

  componentDidCatch(error) {
    console.error("Error inesperado en la interfaz:", error);
  }

  reintentar = () => {
    this.setState({ huboError: false });
  };

  render() {
    if (this.state.huboError) {
      return (
        <PaginaError
          codigo="500"
          titulo="Algo salió mal"
          mensaje="Ocurrió un error inesperado al mostrar esta página. Puedes intentarlo de nuevo o volver al inicio."
          acciones={[
            { texto: "Reintentar", onClick: this.reintentar },
            { texto: "Volver al inicio", to: "/" },
          ]}
        />
      );
    }
    return this.props.children;
  }
}

export default LimiteError;

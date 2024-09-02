import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";
import Swal from "sweetalert2";
import axios from "../../utils/axiosConfig";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const CrearUsuario = ({ open, handleOpen, fetchUsuarios, selectedUser, setSelectedUser, editMode, roles }) => {
  const [formErrors, setFormErrors] = useState({});

  const handleSave = async () => {
    const isValid = validateFields(selectedUser);
    if (!isValid) {
      Toast.fire({
        icon: "error",
        title: "Por favor, completa todos los campos correctamente.",
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/usuarios/${selectedUser.id_usuario}`, selectedUser);
        fetchUsuarios();
        Toast.fire({
          icon: "success",
          title: "¡Actualizado! El usuario ha sido actualizado correctamente.",
        });
      } else {
        await axios.post("http://localhost:3000/api/usuarios/registro", selectedUser);
        fetchUsuarios();
        Toast.fire({
          icon: "success",
          title: "¡Creado! El usuario ha sido creado correctamente.",
        });
      }
      handleOpen();
    } catch (error) {
      console.error("Error saving usuario:", error);
      Toast.fire({
        icon: "error",
        title: "Error al guardar usuario. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const validateFields = (user) => {
    const errors = {};

    if (!user.nombre) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (user.nombre.length < 3) {
      errors.nombre = 'El nombre debe contener al menos 3 letras.';
    } else if (user.nombre.length > 30) {
      errors.nombre = 'El nombre no debe exceder los 30 caracteres.';
    } else if (/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/.test(user.nombre)) {
      errors.nombre = 'El nombre no debe incluir caracteres especiales ni números.';
    }

    if (!user.email) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (user.email.length < 5) {
      errors.email = 'El correo electrónico debe tener al menos 5 caracteres.';
    } else if (user.email.length > 30) {
      errors.email = 'El correo electrónico no debe exceder los 30 caracteres.';
    } else if (!/^[A-Za-z0-9._%+-]+/.test(user.email.split('@')[0])) {
      errors.email = 'La parte local del correo electrónico (antes del @) debe ser alfanumérica y puede incluir ._%+-';
    } else if (!/@/.test(user.email)) {
      errors.email = 'El correo electrónico debe contener un símbolo @.';
    } else if (!/^[A-Za-z0-9.-]+\.[A-Z]{2,}$/i.test(user.email.split('@')[1])) {
      errors.email = 'El dominio del correo electrónico (después del @) debe tener un formato válido.';
    }

    if (!editMode && (!user.password || user.password.length < 8)) {
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (user.password && user.password.length > 15) {
      errors.password = "La contraseña no debe exceder los 15 caracteres.";
    } else if (user.password && !/[A-Za-z]/.test(user.password)) {
      errors.password = "La contraseña debe contener al menos una letra (a-z, A-Z).";
    } else if (user.password && !/[0-9]/.test(user.password)) {
      errors.password = "La contraseña debe contener al menos un número (0-9).";
    } else if (user.password && !/[!@#$%^&*()_+={}\[\]:;'"<>,.?/\\|-]/.test(user.password)) {
      errors.password = "La contraseña debe contener al menos un carácter especial: !@#$%^&*()_+={}[]:;'<>,.?/\\|-";
    }

    if (!user.tipo_documento) {
      errors.tipo_documento = "Debe seleccionar un tipo de documento.";
    }

    if (!user.numero_documento) {
      errors.numero_documento = "Debe ingresar un número de documento.";
    }

    if (!user.genero) {
      errors.genero = "Debe seleccionar un género.";
    }

    if (!user.nacionalidad) {
      errors.nacionalidad = "Debe ingresar una nacionalidad.";
    }

    if (!user.telefono) {
      errors.telefono = "Debe ingresar un número de teléfono.";
    }

    if (!user.direccion) {
      errors.direccion = "Debe ingresar una dirección.";
    }

    if (!user.id_rol) {
      errors.id_rol = "Debe seleccionar un rol.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...selectedUser, [name]: value };
    setSelectedUser(updatedUser);

    // Validar el campo modificado en tiempo real
    validateFields(updatedUser);
  };

  return (
    <Dialog open={open} handler={handleOpen} className="custom-modal bg-white rounded-lg shadow-lg max-w-lg mx-auto">
    <DialogHeader className="bg-white border-b border-gray-200 font-semibold p-4 rounded-t-lg">
      {editMode ? "Editar Usuario" : "Crear Usuario"}
    </DialogHeader>
    <DialogBody className="p-6 space-y-6 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Campos "Nombre" y "Email" en la misma fila */}
        <div>
          <Input
            label="Nombre"
            name="nombre"
            value={selectedUser.nombre}
            onChange={handleChange}
            error={!!formErrors.nombre}
            required
          />
          {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
        </div>
  
        <div>
          <Input
            label="Email"
            name="email"
            value={selectedUser.email}
            onChange={handleChange}
            error={!!formErrors.email}
            required
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
  
        {!editMode && (
          <>
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={selectedUser.password}
              onChange={handleChange}
              error={!!formErrors.password}
              required
            />
            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          </>
        )}
  
        {/* Otros campos del formulario */}
        <Select
          label="Tipo de Documento"
          name="tipo_documento"
          value={selectedUser.tipo_documento}
          onChange={(value) => setSelectedUser({ ...selectedUser, tipo_documento: value })}
          required
        >
          <Option value="CC">CC</Option>
          <Option value="NIT">NIT</Option>
          <Option value="PP">PP</Option>
          <Option value="CE">CE</Option>
        </Select>
        {formErrors.tipo_documento && <p className="text-red-500 text-xs mt-1">{formErrors.tipo_documento}</p>}
  
        <Input
          label="Número de Documento"
          name="numero_documento"
          value={selectedUser.numero_documento}
          onChange={handleChange}
          error={!!formErrors.numero_documento}
          required
        />
        {formErrors.numero_documento && <p className="text-red-500 text-xs mt-1">{formErrors.numero_documento}</p>}
  
        <Select
          label="Género"
          name="genero"
          value={selectedUser.genero}
          onChange={(value) => setSelectedUser({ ...selectedUser, genero: value })}
          required
        >
          <Option value="Masculino">Masculino</Option>
          <Option value="Femenino">Femenino</Option>
          <Option value="OTRO">Prefiero no Responder</Option>
        </Select>
        {formErrors.genero && <p className="text-red-500 text-xs mt-1">{formErrors.genero}</p>}
  
        <Input
          label="Nacionalidad"
          name="nacionalidad"
          value={selectedUser.nacionalidad}
          onChange={handleChange}
          error={!!formErrors.nacionalidad}
          required
        />
        {formErrors.nacionalidad && <p className="text-red-500 text-xs mt-1">{formErrors.nacionalidad}</p>}
  
        <Input
          label="Teléfono"
          name="telefono"
          value={selectedUser.telefono}
          onChange={handleChange}
          error={!!formErrors.telefono}
          required
        />
        {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
  
        <Input
          label="Dirección"
          name="direccion"
          value={selectedUser.direccion}
          onChange={handleChange}
          error={!!formErrors.direccion}
          required
        />
        {formErrors.direccion && <p className="text-red-500 text-xs mt-1">{formErrors.direccion}</p>}
  
        <Select
          label="Rol"
          name="id_rol"
          value={selectedUser.id_rol}
          onChange={(value) => setSelectedUser({ ...selectedUser, id_rol: value })}
          required
        >
          {roles.map((rol) => (
            <Option key={rol.id_rol} value={rol.id_rol}>{rol.nombre_rol}</Option>
          ))}
        </Select>
        {formErrors.id_rol && <p className="text-red-500 text-xs mt-1">{formErrors.id_rol}</p>}
      </div>
    </DialogBody>
    <DialogFooter className="flex justify-end space-x-2">
      <Button
        variant="text"
        color="red"
        onClick={handleOpen}
        className="mr-1"
      >
        Cancelar
      </Button>
      <Button variant="gradient" color="blue" onClick={handleSave}>
        {editMode ? "Actualizar" : "Guardar"}
      </Button>
    </DialogFooter>
  </Dialog>
  );
};

export default CrearUsuario;

import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  IconButton,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import axios from "../../utils/axiosConfig";

export function CrearCompra({ handleClose, fetchCompras, proveedores, insumos }) {
  const [selectedCompra, setSelectedCompra] = useState({
    id_proveedor: "",
    fecha_compra: "",
    fecha_registro: "",
    numero_recibo: "",
    estado: "Completado",
    detalleCompras: [],
    total: 0,
    subtotal: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Establece la fecha actual en el campo de fecha de registro al montar el componente
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    setSelectedCompra(prev => ({ ...prev, fecha_registro: today }));
  }, []);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCompra.id_proveedor) {
      newErrors.id_proveedor = "El proveedor es obligatorio";
    }
    if (!selectedCompra.fecha_compra) {
      newErrors.fecha_compra = "La fecha de compra es obligatoria";
    }
    if (!selectedCompra.fecha_registro) {
      newErrors.fecha_registro = "La fecha de registro es obligatoria";
    }
    if (!selectedCompra.numero_recibo) {
      newErrors.numero_recibo = "El número de recibo es obligatorio";
    }
    if (selectedCompra.detalleCompras.length === 0) {
      newErrors.detalleCompras = "Debe agregar al menos un detalle de compra";
    }
    selectedCompra.detalleCompras.forEach((detalle, index) => {
      if (!detalle.id_insumo) {
        newErrors[`insumo_${index}`] = "El insumo es obligatorio";
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        newErrors[`cantidad_${index}`] = "La cantidad debe ser mayor a 0";
      }
      if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
        newErrors[`precio_unitario_${index}`] = "El precio unitario debe ser mayor a 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Toast.fire({
        icon: "error",
        title: "Por favor, corrija los errores en el formulario.",
      });
      return;
    }

    const insumosSeleccionados = selectedCompra.detalleCompras.map(
      (detalle) => detalle.id_insumo
    );
    const insumosUnicos = new Set(insumosSeleccionados);
    if (insumosSeleccionados.length !== insumosUnicos.size) {
      Toast.fire({
        icon: "error",
        title: "No se pueden seleccionar insumos duplicados.",
      });
      return;
    }

    const compraToSave = {
      id_proveedor: parseInt(selectedCompra.id_proveedor),
      fecha_compra: selectedCompra.fecha_compra,
      fecha_registro: selectedCompra.fecha_registro,
      numero_recibo: selectedCompra.numero_recibo,
      estado: selectedCompra.estado,
      total: selectedCompra.total,
      detalleCompras: selectedCompra.detalleCompras.map((detalle) => ({
        id_insumo: parseInt(detalle.id_insumo),
        cantidad: parseInt(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario),
      })),
    };

    try {
      await axios.post("http://localhost:3000/api/compras", compraToSave);
      Toast.fire({
        icon: "success",
        title: "La compra ha sido creada correctamente.",
      });
      fetchCompras();
      handleClose();
    } catch (error) {
      console.error("Error saving compra:", error);
      Toast.fire({
        icon: "error",
        title: "Hubo un problema al guardar la compra.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCompra({ ...selectedCompra, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedCompra.detalleCompras];

    if (name === "cantidad") {
      detalles[index][name] = value.replace(/\D/, "");
    } else if (name === "precio_unitario") {
      detalles[index][name] = value.replace(/[^\d.]/, "");
    } else {
      detalles[index][name] = value;
    }

    const cantidad = parseFloat(detalles[index].cantidad) || 0;
    const precioUnitario = parseFloat(detalles[index].precio_unitario) || 0;
    detalles[index].subtotal = cantidad * precioUnitario;

    setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
    setErrors({ ...errors, [`${name}_${index}`]: "" });
    updateTotal(detalles);
  };

  const handleAddDetalle = () => {
    setSelectedCompra({
      ...selectedCompra,
      detalleCompras: [
        ...selectedCompra.detalleCompras,
        { id_insumo: "", cantidad: "", precio_unitario: "", subtotal: 0 },
      ],
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedCompra.detalleCompras];
    detalles.splice(index, 1);
    setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
    updateTotal(detalles);
  };

  const updateTotal = (detalles) => {
    const total = detalles.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0);
    setSelectedCompra((prevState) => ({
      ...prevState,
      total,
      subtotal: total,
    }));
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 bg-white shadow-lg rounded-lg">
      <Typography variant="h5" color="blue-gray" className="mb-4">
        Crear Compra
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Select
            label="Proveedor"
            name="id_proveedor"
            value={selectedCompra.id_proveedor}
            onChange={(e) => {
              setSelectedCompra({ ...selectedCompra, id_proveedor: e });
              setErrors({ ...errors, id_proveedor: "" });
            }}
            className={`w-full ${errors.id_proveedor ? "border-red-500" : ""}`}
            required
          >
            {proveedores
              .filter((proveedor) => proveedor.activo)
              .map((proveedor) => (
                <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                  {proveedor.nombre}
                </Option>
              ))}
          </Select>
          {errors.id_proveedor && <p className="text-red-500 text-sm mt-1">{errors.id_proveedor}</p>}
        </div>
        <div>
          <Input
            label="Fecha de Compra"
            name="fecha_compra"
            type="date"
            value={selectedCompra.fecha_compra}
            onChange={handleChange}
            className={`w-full ${errors.fecha_compra ? "border-red-500" : ""}`}
            required
          />
          {errors.fecha_compra && <p className="text-red-500 text-sm mt-1">{errors.fecha_compra}</p>}
        </div>
        <div>
          <Input
            label="Fecha de Registro"
            name="fecha_registro"
            type="date"
            value={selectedCompra.fecha_registro}
            readOnly
            className={`w-full bg-gray-100 ${errors.fecha_registro ? "border-red-500" : ""}`}
            required
          />
          {errors.fecha_registro && <p className="text-red-500 text-sm mt-1">{errors.fecha_registro}</p>}
        </div>
        <div>
          <Input
            label="Número de Recibo"
            name="numero_recibo"
            type="text"
            value={selectedCompra.numero_recibo}
            onChange={handleChange}
            className={`w-full ${errors.numero_recibo ? "border-red-500" : ""}`}
            required
          />
          {errors.numero_recibo && <p className="text-red-500 text-sm mt-1">{errors.numero_recibo}</p>}
        </div>
      </div>

      <Typography variant="h6" color="blue-gray" className="mb-4 text-lg font-semibold">
        Insumos a comprar
      </Typography>

      <div className="bg-white p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {selectedCompra.detalleCompras.map((detalle, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Select
                  label="Insumo"
                  name="id_insumo"
                  value={detalle.id_insumo}
                  onChange={(e) => {
                    handleDetalleChange(index, { target: { name: "id_insumo", value: e } });
                    setErrors({ ...errors, [`insumo_${index}`]: "" });
                  }}
                  className={`w-full ${errors[`insumo_${index}`] ? "border-red-500" : ""}`}
                >
                  {insumos
                    .filter((insumo) => insumo.activo)
                    .map((insumo) => (
                      <Option key={insumo.id_insumo} value={insumo.id_insumo}>
                        {insumo.nombre}
                      </Option>
                    ))}
                </Select>
                {errors[`insumo_${index}`] && <p className="text-red-500 text-sm">{errors[`insumo_${index}`]}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  required
                  value={detalle.cantidad}
                  onChange={(e) => {
                    handleDetalleChange(index, e);
                    setErrors({ ...errors, [`cantidad_${index}`]: "" });
                  }}
                  className={`w-full ${errors[`cantidad_${index}`] ? "border-red-500" : ""}`}
                />
                {errors[`cantidad_${index}`] && <p className="text-red-500 text-sm">{errors[`cantidad_${index}`]}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Precio Unitario"
                  name="precio_unitario"
                  type="number"
                  step="0.01"
                  required
                  value={detalle.precio_unitario}
                  onChange={(e) => {
                    handleDetalleChange(index, e);
                    setErrors({ ...errors, [`precio_unitario_${index}`]: "" });
                  }}
                  className={`w-full ${errors[`precio_unitario_${index}`] ? "border-red-500" : ""}`}
                />
                {errors[`precio_unitario_${index}`] && <p className="text-red-500 text-sm">{errors[`precio_unitario_${index}`]}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  label="Subtotal"
                  name="subtotal"
                  type="text"
                  value={`$${(detalle.subtotal || 0).toFixed(2)}`}
                  readOnly
                  className="w-full bg-gray-100"
                />
              </div>
              <IconButton
                color="red"
                onClick={() => handleRemoveDetalle(index)}
                size="sm"
                className="self-start"
              >
                <TrashIcon className="h-5 w-5" />
              </IconButton>
            </div>
          ))}
        </div>

        <Button
          size="sm"
          onClick={handleAddDetalle}
          className="flex items-center gap-2 bg-black text-white hover:bg-pink-800 px-2 py-1 rounded-md mt-4"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="sr-only">Agregar Detalle</span>
        </Button>
      </div>

      <Typography variant="h6" color="blue-gray" className="mt-4 mb-2 text-lg font-semibold">
        Total de la Compra: ${(selectedCompra.total || 0).toFixed(2)}
      </Typography>

      <div className="flex gap-2 mt-4 justify-end">
  <Button
    variant="text"
    color="gray"
    className="btncancelarm text-white"
    size="sm"
    onClick={handleClose}
  >
    Cancelar
  </Button>
  <Button
    variant="gradient"
    color="blue"
    className="btnagregarm text-white"
    size="sm"
    onClick={handleSave}
  >
    Crear Compra
  </Button>
</div>

    </div>
  );
}

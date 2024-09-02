import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  Option,
  IconButton,
  Typography
} from "@material-tailwind/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function EditarPedido({ pedido, clientes = [], productos = [], fetchPedidos, onCancel }) {
  const [selectedPedido, setSelectedPedido] = useState({
    id_cliente: "",
    numero_pedido: "",
    fecha_entrega: "",
    fecha_pago: "",
    estado: "Esperando Pago",
    pagado: false,
    detallesPedido: [], // Aseguramos que siempre sea un array
    clientesh: { nombre: "", contacto: "" }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pedido) {
      setSelectedPedido({
        ...pedido,
        detallesPedido: pedido.detallesPedido || [], // Aseguramos que siempre sea un array
        clientesh: pedido.clientesh || { nombre: "", contacto: "" }
      });
    }
  }, [pedido]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPedido({ ...selectedPedido, [name]: value });
  };

  const handleDetalleChange = (index, name, value) => {
    const detalles = [...selectedPedido.detallesPedido];
    detalles[index][name] = value;
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedPedido({
      ...selectedPedido,
      detallesPedido: [...selectedPedido.detallesPedido, { id_producto: "", cantidad: "" }]
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedPedido.detallesPedido];
    detalles.splice(index, 1);
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handlePagadoChange = (e) => {
    const isChecked = e.target.checked;
    const newEstado = isChecked ? "Pendiente de Preparación" : "Esperando Pago";
    setSelectedPedido({
      ...selectedPedido,
      pagado: isChecked,
      fecha_pago: isChecked ? selectedPedido.fecha_pago : "",
      estado: newEstado
    });
  };

  const handleSave = async () => {
    if (!selectedPedido.id_cliente || !selectedPedido.fecha_entrega || selectedPedido.detallesPedido.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      });
      return;
    }

    const newErrors = {};
    if (!selectedPedido.id_cliente) {
      newErrors.id_cliente = "El cliente es obligatorio ";
    }
    if (!selectedPedido.numero_pedido) {
      newErrors.numero_pedido = "El número de pedido es obligatorio";
    }
    if (!selectedPedido.fecha_entrega) {
      newErrors.fecha_entrega = "La fecha de entrega es obligatoria";
    }
    if (!selectedPedido.estado) {
      newErrors.estado = "El estado es obligatorio";
    }
    selectedPedido.detallesPedido.forEach((detalle, index) => {
      if (!detalle.id_producto) {
        newErrors[`producto_${index}`] = "El producto es obligatorio";
      }
      if (!detalle.cantidad) {
        newErrors[`cantidad_${index}`] = "La cantidad es obligatoria";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const pedidoToSave = {
      id_cliente: parseInt(selectedPedido.id_cliente),
      numero_pedido: selectedPedido.numero_pedido,
      fecha_entrega: new Date(selectedPedido.fecha_entrega).toISOString(),
      fecha_pago: selectedPedido.pagado && selectedPedido.fecha_pago ? new Date(selectedPedido.fecha_pago).toISOString() : null,
      estado: selectedPedido.pagado ? "Pendiente de Preparación" : "Esperando Pago",
      pagado: selectedPedido.pagado,
      detallesPedido: selectedPedido.detallesPedido.map(detalle => ({
        id_producto: parseInt(detalle.id_producto),
        cantidad: parseInt(detalle.cantidad)
      }))
    };

    try {
      await axios.put(`http://localhost:3000/api/pedidos/${selectedPedido.id_pedido}`, pedidoToSave);
      Swal.fire({
        title: '¡Actualización exitosa!',
        text: 'El pedido ha sido actualizado correctamente.',
        icon: 'success',
      });
      fetchPedidos(); // Actualizar la lista de pedidos
      onCancel(); // Regresar a la lista de pedidos
    } catch (error) {
      console.error("Error updating pedido:", error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el pedido.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <Typography className="text-black p-2 text-lg mb-4">Editar Pedido</Typography>
      <div className="flex flex-col gap-4">
        <div className="w-full max-w-xs">
          <Select
            label="Cliente"
            name="id_cliente"
            value={selectedPedido.id_cliente}
            onChange={(e) => handleChange({ target: { name: 'id_cliente', value: e } })}
            className="w-full text-xs"
            required
          >
            {clientes.map(cliente => (
              <Option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombre}
              </Option>
            ))}
          </Select>
        </div>
        <div className="w-full max-w-xs">
          <Input
            label="Número de Pedido"
            name="numero_pedido"
            type="text"
            value={selectedPedido.numero_pedido}
            onChange={handleChange}
            className="w-full text-xs"
            disabled
          />
        </div>
        <div className="w-full max-w-xs">
          <Input
            label="Fecha de Entrega"
            name="fecha_entrega"
            type="date"
            value={selectedPedido.fecha_entrega}
            onChange={handleChange}
            className="w-full text-xs"
            required
          />
        </div>
        <div className="w-full max-w-xs">
          <Input
            label="Fecha de Pago"
            name="fecha_pago"
            type="date"
            value={selectedPedido.fecha_pago ? selectedPedido.fecha_pago : ""}
            onChange={handleChange}
            className="w-full text-xs"
            disabled={!selectedPedido.pagado}
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Typography className="text-gray-700">Pagado:</Typography>
          <input
            type="checkbox"
            name="pagado"
            checked={selectedPedido.pagado}
            onChange={handlePagadoChange}
            className="form-checkbox"
          />
        </div>
        <Typography variant="h6" color="black" className="text-ms">
          Agregar Productos
        </Typography>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col gap-2">
          {(selectedPedido.detallesPedido || []).map((detalle, index) => (
            <div key={index} className="relative flex flex-col gap-2 mb-4">
              <div className="flex flex-col gap-2">
                <Select
                  label="Producto"
                  required
                  name="id_producto"
                  value={detalle.id_producto}
                  onChange={(e) => handleDetalleChange(index, 'id_producto', e)}
                  className="w-full"
                >
                  {productos.map(producto => (
                    <Option key={producto.id_producto} value={producto.id_producto}>
                      {producto.nombre}
                    </Option>
                  ))}
                </Select>
                <Input
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  required
                  value={detalle.cantidad}
                  onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end">
                  <IconButton
                    color="red"
                    onClick={() => handleRemoveDetalle(index)}
                    className="btncancelarm"
                    size="sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 flex justify-end">
            <Button className="btnmas" size="sm" onClick={handleAddDetalle}>
              <PlusIcon className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="text" className="btncancelarm" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="gradient" className="btnagregarm" size="sm" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

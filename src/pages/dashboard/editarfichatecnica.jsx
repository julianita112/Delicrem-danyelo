import {
    DialogBody,
    DialogFooter,
    Typography,
    Input,
    Button,
    IconButton,
  } from "@material-tailwind/react";
  import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
  import { useEffect, useState } from "react";
  import Swal from "sweetalert2";
  import axios from "../../utils/axiosConfig";
  
  export function EditarFichaTecnica({ handleClose, fetchFichas, ficha, productos, insumos }) {
    const [selectedFicha, setSelectedFicha] = useState(ficha);
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      setSelectedFicha(ficha);
    }, [ficha]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSelectedFicha({ ...selectedFicha, [name]: value });
      setErrors({ ...errors, [name]: "" });
    };
  
    const handleDetalleChange = (index, e) => {
      const { name, value } = e.target;
      const detalles = [...selectedFicha.detallesFichaTecnicat];
      detalles[index][name] = value;
      setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
      setErrors({ ...errors, [`${name}_${index}`]: "" });
    };
  
    const handleAddDetalle = () => {
      const insumosIds = selectedFicha.detallesFichaTecnicat.map(detalle => detalle.id_insumo);
      const hasDuplicate = insumosIds.some((id, index) => insumosIds.indexOf(id) !== index);
  
      if (hasDuplicate) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'No se pueden agregar insumos duplicados.',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
  
      if (!selectedFicha.detallesFichaTecnicat.some(detalle => detalle.id_insumo === "" || detalle.cantidad === "")) {
        setSelectedFicha({
          ...selectedFicha,
          detallesFichaTecnicat: [...selectedFicha.detallesFichaTecnicat, { id_insumo: "", cantidad: "" }]
        });
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Completa todos los campos antes de agregar.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    };
  
    const handleRemoveDetalle = (index) => {
      const detalles = [...selectedFicha.detallesFichaTecnicat];
      detalles.splice(index, 1);
      setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
    };
  
    const validateForm = () => {
      const newErrors = {};
      if (!selectedFicha.id_producto) newErrors.id_producto = "El producto es requerido";
      if (!selectedFicha.descripcion) newErrors.descripcion = "La descripción es requerida";
      if (!selectedFicha.insumos) newErrors.insumos = "Los insumos son requeridos";
      
      selectedFicha.detallesFichaTecnicat.forEach((detalle, index) => {
        if (!detalle.id_insumo) newErrors[`id_insumo_${index}`] = "El insumo es requerido";
        if (!detalle.cantidad) newErrors[`cantidad_${index}`] = "La cantidad es requerida";
      });
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSave = async () => {
      if (!validateForm()) {
        return;
      }
  
      const fichaToSave = {
        ...selectedFicha,
        detallesFichaTecnica: selectedFicha.detallesFichaTecnicat,
      };
  
      try {
        await axios.put(`http://localhost:3000/api/fichastecnicas/${selectedFicha.id_ficha}`, fichaToSave);
        Swal.fire('¡Actualización exitosa!', 'La ficha técnica ha sido actualizada correctamente.', 'success');
        fetchFichas();
        handleClose();
      } catch (error) {
        console.error("Error saving ficha:", error);
        if (error.response && error.response.data && error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "Hubo un problema al guardar la ficha técnica." });
        }
      }
    };
  
    return (
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Similar estructura del cuerpo del diálogo que ya tenías */}
        {/* Inputs para producto, descripción, insumos y detalles */}
        {/* Similar a lo que tenías en el código original */}
        <DialogBody divider className="flex max-h-[60vh] p-4 gap-6">
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="w-[300px]">
              <label className="block text-xs font-medium text-gray-700">Producto:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                name="id_producto"
                required
                value={selectedFicha.id_producto}
                onChange={handleChange}
              >
                <option value="">Seleccione un producto</option>
                {productos.filter(producto => producto.activo).map(producto => (
                  <option key={producto.id_producto} value={producto.id_producto}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
              {errors.id_producto && <p className="text-red-500 text-xs mt-1">{errors.id_producto}</p>}
            </div>
            <div className="w-[300px]">
              <Input
                label="Descripción de la ficha técnica"
                name="descripcion"
                required
                value={selectedFicha.descripcion}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
            </div>
            <div className="w-[300px]">
              <Input
                label="Descripción detallada de los insumos"
                name="insumos"
                required
                value={selectedFicha.insumos}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
              {errors.insumos && <p className="text-red-500 text-xs mt-1">{errors.insumos}</p>}
            </div>
            <Typography variant="h6" color="blue-gray" className="mt--1 text-sm">
              Detalles de Insumos
            </Typography>
            <div className="bg-gray-100 p-4 rounded-xs shadow-md flex-1 mt-2 mb-4">
              {selectedFicha.detallesFichaTecnicat.map((detalle, index) => (
                <div key={index} className="flex flex-col gap-4 mb-2">
                  <div className="w-[300px]">
                    <label className="block font-medium text-gray-700">Insumo:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-blue-500"
                      name="id_insumo"
                      value={detalle.id_insumo}
                      required
                      onChange={(e) => handleDetalleChange(index, e)}
                    >
                      <option value="">Seleccione un insumo</option>
                      {insumos.filter(insumo => insumo.activo).map(insumo => (
                        <option key={insumo.id_insumo} value={insumo.id_insumo}>
                          {insumo.nombre}
                        </option>
                      ))}
                    </select>
                    {errors[`id_insumo_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`id_insumo_${index}`]}</p>}
                  </div>
                  <div className="w-[300px] text-sm">
                    <Input
                      label="Cantidad"
                      name="cantidad"
                      required
                      type="number"
                      value={detalle.cantidad}
                      onChange={(e) => handleDetalleChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {errors[`cantidad_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`cantidad_${index}`]}</p>}
                  </div>
                  <div className="w-[300px]">
                    <IconButton
                      color="red"
                      onClick={() => handleRemoveDetalle(index)}
                      className="btncancelarm"
                      size="sm"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>
              ))}
              <Button className="btnmas" size="sm" onClick={handleAddDetalle}>
                <PlusIcon className="h-5 w-6 mr-0" />
              </Button>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="bg-white p-4 flex justify-end gap-2">
          <Button variant="text" className="btncancelarm" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="gradient" className="btnagregarm" size="sm" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </div>
    );
  }
  
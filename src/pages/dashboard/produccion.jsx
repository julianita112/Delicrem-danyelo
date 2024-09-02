import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { PlusIcon, EyeIcon, CogIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';
import OrdenesProducidas from "./OrdenesProducidas";
import OrdenesInactivas from "./OrdenesInactivas";
import CrearProduccion from "./CrearProduccion";
import EditarProduccion from "./EditarProduccion";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function OrdenesProduccion() {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ordenesPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [showOrdenesProducidas, setShowOrdenesProducidas] = useState(false);
  const [showOrdenesInactivas, setShowOrdenesInactivas] = useState(false);
  const [showCrearProduccion, setShowCrearProduccion] = useState(false);
  const [showEditarProduccion, setShowEditarProduccion] = useState(false);

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/ordenesproduccion");
      setOrdenes(response.data);
      setFilteredOrdenes(response.data);
    } catch (error) {
      console.error("Error fetching ordenes de producción:", error);
    }
  };

  useEffect(() => {
    const filtered = ordenes.filter((orden) =>
      orden.numero_orden.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOrdenes(filtered);
  }, [search, ordenes]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (orden) => {
    setSelectedOrden(orden);
    setDetailsOpen(true);
  };

  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleProducir = async (idOrden) => {
    try {
      await axios.post(`http://localhost:3000/api/ordenesproduccion/${idOrden}/producir`);
      Toast.fire({
        icon: 'success',
        title: '¡Orden producida exitosamente!'
      });
      fetchOrdenes(); // Actualizar la lista de órdenes después de la producción
    } catch (error) {
      console.error("Error produciendo la orden:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al producir',
        text: 'Hubo un problema al intentar producir la orden.',
        confirmButtonText: 'Aceptar',
        background: '#ffff',
        iconColor: '#A62A64',
        confirmButtonColor: '#000000',
        customClass: {
          title: 'text-lg font-semibold',
          icon: 'text-2xl',
          confirmButton: 'px-4 py-2 text-white'
        }
      });
    }
  };

  const handleEditOrden = (orden) => {
    setSelectedOrden(orden);
    setShowEditarProduccion(true);
  };

  const toggleOrdenesProducidas = () => {
    setShowOrdenesProducidas(!showOrdenesProducidas);
    setShowOrdenesInactivas(false); // Asegurar que no se muestren ambas listas al mismo tiempo
  };

  const toggleOrdenesInactivas = () => {
    setShowOrdenesInactivas(!showOrdenesInactivas);
    setShowOrdenesProducidas(false); // Asegurar que no se muestren ambas listas al mismo tiempo
  };

  const toggleCrearProduccion = () => {
    setShowCrearProduccion(!showCrearProduccion);
    if (showCrearProduccion) {
      fetchOrdenes(); // Refresca las órdenes al cerrar el diálogo
    }
  };

  const toggleEditarProduccion = () => {
    setShowEditarProduccion(!showEditarProduccion);
    if (showEditarProduccion) {
      fetchOrdenes(); // Refresca las órdenes al cerrar el diálogo
    }
  };

  const handleDownloadDetails = (orden) => {
    const doc = new jsPDF();
    doc.text(`Detalles de la Orden: ${orden.numero_orden}`, 10, 10);
    doc.autoTable({
      head: [['Producto', 'Cantidad']],
      body: orden.ordenProduccionDetalles.map(detalle => [
        detalle.productoDetalleOrdenProduccion.nombre,
        detalle.cantidad
      ])
    });
    doc.save(`Orden_${orden.numero_orden}_detalles.pdf`);
  };

  const toggleActivo = async (idOrden, currentStatus) => {
    try {
      await axios.patch(`http://localhost:3000/api/ordenesproduccion/${idOrden}/activo`, {
        activo: !currentStatus,
      });
      Toast.fire({
        icon: 'success',
        title: `¡Orden ${!currentStatus ? 'activada' : 'desactivada'} exitosamente!`
      });
      fetchOrdenes(); // Actualizar la lista de órdenes después de activar/desactivar
    } catch (error) {
      console.error("Error al cambiar el estado de la orden:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al intentar cambiar el estado de la orden.',
        confirmButtonText: 'Aceptar',
        background: '#ffff',
        iconColor: '#A62A64',
        confirmButtonColor: '#000000',
        customClass: {
          title: 'text-lg font-semibold',
          icon: 'text-2xl',
          confirmButton: 'px-4 py-2 text-white'
        }
      });
    }
  };

  const indexOfLastOrden = currentPage * ordenesPerPage;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPerPage;
  const currentOrdenes = filteredOrdenes.slice(indexOfFirstOrden, indexOfLastOrden);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="w-3/4">
        <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
          <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
        </div>

        {showOrdenesProducidas ? (
          <OrdenesProducidas />
        ) : showOrdenesInactivas ? (
          <OrdenesInactivas />
        ) : (
          <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
            <CardBody className="p-4">
              <Input
                type="text"
                placeholder="Buscar por número de orden..."
                value={search}
                onChange={handleSearchChange}
                className="mb-6"
              />
              <div className="mb-1">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Lista de Órdenes de Producción
                </Typography>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número de Orden
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Orden
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Productos
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrdenes.map((orden) => (
                        <tr key={orden.id_orden}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {orden.numero_orden}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {orden.fecha_orden}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {orden.ordenProduccionDetalles.slice(0, 3).map(detalle => (
                              <div key={detalle.id_detalle_orden}>
                                <Typography className="text-sm">
                                  {detalle.productoDetalleOrdenProduccion.nombre}: {detalle.cantidad}
                                </Typography>
                              </div>
                            ))}
                            {orden.ordenProduccionDetalles.length > 3 && (
                              <Typography className="text-sm text-gray-400">
                                y {orden.ordenProduccionDetalles.length - 3} más...
                              </Typography>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => toggleActivo(orden.id_orden, orden.activo)}
                              className={`relative inline-flex items-center h-6 w-12 rounded-full p-1 duration-300 ease-in-out ${
                                orden.activo
                                  ? 'bg-gradient-to-r from-green-800 to-green-600 hover:from-green-600 hover:to-green-400 shadow-lg'
                                  : 'bg-gradient-to-r from-red-800 to-red-500 hover:from-red-600 hover:to-red-400 shadow-lg'
                              }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                                  orden.activo ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <IconButton
                                className="btnvisualizar"
                                size="sm"
                                onClick={() => handleViewDetails(orden)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton
                                className="btnproducir"
                                size="sm"
                                color="green"
                                onClick={() => handleProducir(orden.id_orden)}
                              >
                                <CogIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton
                                className="btnedit"
                                size="sm"
                                color="blue"
                                onClick={() => handleEditOrden(orden)}
                              >
                                <CogIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton
                                className="btndescargar"
                                size="sm"
                                color="blue-gray"
                                onClick={() => handleDownloadDetails(orden)}
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center mt-4">
                  {Array.from({ length: Math.ceil(filteredOrdenes.length / ordenesPerPage) }, (_, i) => i + 1).map(number => (
                    <Button
                      key={number}
                      className={`pagination ${currentPage === number ? "active" : ""}`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Sidebar dentro del componente */}
      <div className="w-1/4 p-4 bg-white border-l border-gray-200">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Opciones
        </Typography>
        <ul>
          <li className="mb-2">
            <Button
              fullWidth
              color="blue-gray"
              size="sm"
              onClick={toggleCrearProduccion}
            >
              Crear Órdenes de Producción
            </Button>
          </li>
          <li className="mb-2">
            <Button
              fullWidth
              color="blue-gray"
              size="sm"
              onClick={toggleOrdenesProducidas}
            >
              Órdenes Producidas
            </Button>
          </li>
          <li>
            <Button
              fullWidth
              color="blue-gray"
              size="sm"
              onClick={toggleOrdenesInactivas}
            >
              Órdenes Inactivas
            </Button>
          </li>
        </ul>
      </div>

      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="max-w-xs w-11/12 bg-white rounded-lg shadow-lg" size="xs">
        <DialogHeader className="text-xl font-bold text-gray-800">
          Detalles de la Orden de Producción
        </DialogHeader>
        <DialogBody className="space-y-2">
          <div className="space-y-1">
            <Typography variant="subtitle2" className="font-bold text-gray-800">ID Orden:</Typography>
            <Typography className="text-sm">{selectedOrden.id_orden}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Número de Orden:</Typography>
            <Typography className="text-sm">{selectedOrden.numero_orden}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Fecha de Orden:</Typography>
            <Typography className="text-sm">{selectedOrden.fecha_orden}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Producción Completada:</Typography>
            <Typography className="text-sm">{selectedOrden.produccion_completada ? "Sí" : "No"}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Activo:</Typography>
            <Typography className="text-sm">{selectedOrden.activo ? "Sí" : "No"}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Productos:</Typography>
            {selectedOrden.ordenProduccionDetalles?.map(detalle => (
              <Typography key={detalle.id_detalle_orden} className="text-sm">
                {detalle.productoDetalleOrdenProduccion.nombre}: {detalle.cantidad}
              </Typography>
            ))}
            <Typography variant="subtitle2" className="font-bold text-gray-800">Creado:</Typography>
            <Typography className="text-sm">{selectedOrden.createdAt ? new Date(selectedOrden.createdAt).toLocaleString() : 'N/A'}</Typography>
            <Typography variant="subtitle2" className="font-bold text-gray-800">Actualizado:</Typography>
            <Typography className="text-sm">{selectedOrden.updatedAt ? new Date(selectedOrden.updatedAt).toLocaleString() : 'N/A'}</Typography>
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-center">
          <Button className="btncancelarm" size="sm" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Incluir los componentes CrearProduccion y EditarProduccion con su estado de visibilidad */}
      <CrearProduccion open={showCrearProduccion} handleCreateProductionOpen={toggleCrearProduccion} refreshOrders={fetchOrdenes} />
      <EditarProduccion open={showEditarProduccion} handleEditProductionOpen={toggleEditarProduccion} orden={selectedOrden} refreshOrders={fetchOrdenes} />
    </div>
  );
}

export default OrdenesProduccion;
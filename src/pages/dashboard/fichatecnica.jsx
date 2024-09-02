import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';
import { CrearFichaTecnica } from './CrearFichaTecnica';
import { EditarFichaTecnica } from './EditarFichaTecnica';

export function FichasTecnicas() {
  const [fichas, setFichas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [filteredFichas, setFilteredFichas] = useState([]);
  const [showForm, setShowForm] = useState(false); // Estado para controlar la vista del formulario
  const [editMode, setEditMode] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState({
    id_producto: "",
    descripcion: "",
    insumos: "",
    detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [fichasPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFichas();
    fetchProductos();
    fetchInsumos();
  }, []);

  const fetchFichas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/fichastecnicas");
      setFichas(response.data);
      setFilteredFichas(response.data);
    } catch (error) {
      console.error("Error fetching fichas:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/insumos");
      setInsumos(response.data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    }
  };

  useEffect(() => {
    filterFichas();
  }, [search, fichas]);

  const filterFichas = () => {
    const filtered = fichas.filter((ficha) =>
      ficha.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFichas(filtered);
  };

  const handleEdit = (ficha) => {
    setSelectedFicha(ficha);
    setEditMode(true);
    setShowForm(true); // Mostrar el formulario de edición
  };

  const handleCreate = () => {
    setSelectedFicha({
      id_producto: "",
      descripcion: "",
      insumos: "",
      detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
    });
    setEditMode(false);
    setShowForm(true); // Mostrar el formulario de creación
  };

  const handleDelete = async (ficha) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la ficha técnica ${ficha.descripcion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/fichastecnicas/${ficha.id_ficha}`);
        fetchFichas();
        Swal.fire('¡Eliminado!', 'La ficha técnica ha sido eliminada.', 'success');
      } catch (error) {
        console.error("Error deleting ficha:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar la ficha técnica.', 'error');
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    setEditMode(false);
    fetchFichas();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditMode(false);
  };

  const indexOfLastFicha = currentPage * fichasPerPage;
  const indexOfFirstFicha = indexOfLastFicha - fichasPerPage;
  const currentFichas = filteredFichas.slice(indexOfFirstFicha, indexOfLastFicha);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredFichas.length / fichasPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          {!showForm ? ( // Mostrar lista o formulario según el estado
            <>
            <div className="flex items-center justify-between mb-6">
              <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
                Crear Ficha Técnica
              </Button>
             
              <input
                  type="text"
                  placeholder="Buscar por descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-4 border border-gray-300 rounded-md focus:border-blue-500 appearance-none shadow-none py-2 px-4 text-sm" // Ajusta el padding vertical y horizontal
                  style={{ width: '265px' }} // Ajusta el ancho del campo de búsqueda
                />
              </div>
              <div className="mb-1">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Lista de Fichas Técnicas
                </Typography>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th scope="col" className="px-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Insumos
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
                      {currentFichas.map((ficha) => (
                        <tr key={ficha.id_ficha}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-sm text-gray-900">{ficha.descripcion}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-sm text-gray-900">
                              {productos.find(producto => producto.id_producto === ficha.id_producto)?.nombre || 'Producto no encontrado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-sm text-gray-900">{ficha.insumos}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <label className="inline-flex relative items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={ficha.activo}
                                onChange={() => toggleActivo(ficha.id_ficha, ficha.activo)}
                              />
                              <div
                                className={`relative inline-flex items-center h-6 w-12 rounded-full p-1 duration-300 ease-in-out ${
                                  ficha.activo
                                    ? 'bg-gradient-to-r from-green-800 to-green-600 hover:from-green-600 hover:to-green-400 shadow-lg'
                                    : 'bg-gradient-to-r from-red-800 to-red-500 hover:from-red-600 hover:to-red-400 shadow-lg'
                                }`}
                              >
                                <span
                                  className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                                    ficha.activo ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </div>
                            </label>
                          </td>
                          <td className="flex space-x-1">
                            <IconButton
                              className="btnedit"
                              size="sm"
                              onClick={() => handleEdit(ficha)}
                              disabled={!ficha.activo}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                              className="cancelar"
                              size="sm"
                              onClick={() => handleDelete(ficha)}
                              disabled={!ficha.activo}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              className="btnvisualizar"
                              size="sm"
                              onClick={() => handleViewDetails(ficha)}
                              disabled={!ficha.activo}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <ul className="flex justify-center items-center space-x-2">
                    {pageNumbers.map((number) => (
                      <Button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`pagination ${number === currentPage ? 'active' : ''}`}
                        size="sm"
                      >
                        {number}
                      </Button>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {editMode ? (
                <EditarFichaTecnica
                  handleClose={handleCancel}
                  fetchFichas={fetchFichas}
                  ficha={selectedFicha}
                  productos={productos}
                  insumos={insumos}
                  onSaveSuccess={handleSaveSuccess}
                />
              ) : (
                <CrearFichaTecnica
                  handleClose={handleCancel}
                  fetchFichas={fetchFichas}
                  productos={productos}
                  insumos={insumos}
                  fichas={fichas}
                  onSaveSuccess={handleSaveSuccess}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>
    </>
  );
}

import React, { useState, useEffect } from "react";

const QpiTable = () => {
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAspiData, setNewAspiData] = useState({
    type: "ASPI 1",
    ausfallstunden: "",
    arbeitsstunden: "",
    year: "",
    meldepflichtigeUnfalle: "",
    unfalleVerletzungen: "",
    ausfalltageKrankheit: "",
    solltageGesamt: ""
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Charger les données depuis localStorage au montage du composant
  useEffect(() => {
    const savedData = localStorage.getItem("qpiTableData");
    if (savedData) {
      setTableData(JSON.parse(savedData));
    } else {
      // Données initiales si rien n'est sauvegardé
      const initialData = [
        {
          id: 1,
          asp: "ASPI 1",
          description: "Anteil Ausfallstunden durch Krankheitstunden (inkl. Unfälle) an Gesamtarbeitsstunden",
          values: ["4,64%", "10,46%", "4,28%", "11,80%", "11,03%", "12,85%", "18,22%"]
        },
        {
          id: 2,
          asp: "ASPI 2",
          description: "Anteil Ausfallstunde meldepflichtige Unfälle an Gesamtarbeitsstunden",
          values: ["3,18%", "3,88%", "0,00%", "0,00%", "1,66%", "0,00%", "0,00%"]
        },
        {
          id: 3,
          asp: "ASPI 3",
          description: "Arbeitsunfallquote",
          values: ["0,103", "0,042", "-", "-", "0,070", "-", "-"]
        },
        {
          id: 4,
          asp: "ASPI 4",
          description: "Krankenquote (Ausfalltage Krankheit / Solltage MA)",
          values: ["", "", "", "", "", "", "16,99%"]
        }
      ];
      setTableData(initialData);
      localStorage.setItem("qpiTableData", JSON.stringify(initialData));
    }
  }, []);

  // Afficher une notification
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Activer le mode édition pour une ligne
  const handleEdit = (rowIndex) => {
    setEditingRow(rowIndex);
    setEditData({ ...tableData[rowIndex] });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    const newData = [...tableData];
    newData[editingRow] = editData;
    setTableData(newData);
    localStorage.setItem("qpiTableData", JSON.stringify(newData));
    setEditingRow(null);
    setEditData({});
    showNotification("Änderungen erfolgreich gespeichert!", "success");
  };

  // Ouvrir la boîte de confirmation de suppression
  const handleDeleteClick = (rowIndex) => {
    setRowToDelete(rowIndex);
    setShowConfirmDialog(true);
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    const newData = tableData.filter((_, index) => index !== rowToDelete);
    setTableData(newData);
    localStorage.setItem("qpiTableData", JSON.stringify(newData));
    setShowConfirmDialog(false);
    setRowToDelete(null);
    showNotification("Zeile erfolgreich gelöscht!", "success");
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setRowToDelete(null);
  };

  // Gérer les changements dans les champs de texte
  const handleInputChange = (field, value, isValueField = false, valueIndex = null) => {
    if (isValueField && valueIndex !== null) {
      const newValues = [...editData.values];
      newValues[valueIndex] = value;
      setEditData({ ...editData, values: newValues });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  // Gérer les changements dans le formulaire d'ajout
  const handleAddFormChange = (field, value) => {
    setNewAspiData({ ...newAspiData, [field]: value });
  };

  // Calculer la valeur en temps réel pour l'affichage
  const calculateRealTimeValue = () => {
    const { 
      type, 
      ausfallstunden, 
      arbeitsstunden, 
      meldepflichtigeUnfalle, 
      unfalleVerletzungen, 
      ausfalltageKrankheit, 
      solltageGesamt 
    } = newAspiData;

    try {
      switch (type) {
        case "ASPI 1":
          if (!ausfallstunden || !arbeitsstunden) return "";
          const ausfall1 = parseFloat(ausfallstunden.replace(',', '.'));
          const arbeits1 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(ausfall1) || isNaN(arbeits1) || arbeits1 === 0) return "";
          return (ausfall1 / arbeits1 * 100).toFixed(2).replace('.', ',') + "%";

        case "ASPI 2":
          if (!meldepflichtigeUnfalle || !arbeitsstunden) return "";
          const ausfall2 = parseFloat(meldepflichtigeUnfalle.replace(',', '.'));
          const arbeits2 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(ausfall2) || isNaN(arbeits2) || arbeits2 === 0) return "";
          return (ausfall2 / arbeits2 * 100).toFixed(2).replace('.', ',') + "%";

        case "ASPI 3":
          if (!unfalleVerletzungen || !arbeitsstunden) return "";
          const unfalle = parseFloat(unfalleVerletzungen.replace(',', '.'));
          const arbeits3 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(unfalle) || isNaN(arbeits3) || arbeits3 === 0) return "";
          return (unfalle / arbeits3).toFixed(3).replace('.', ',');

        case "ASPI 4":
          if (!ausfalltageKrankheit || !solltageGesamt) return "";
          const ausfalltage = parseFloat(ausfalltageKrankheit.replace(',', '.'));
          const solltage = parseFloat(solltageGesamt.replace(',', '.'));
          if (isNaN(ausfalltage) || isNaN(solltage) || solltage === 0) return "";
          return (ausfalltage / solltage * 100).toFixed(2).replace('.', ',') + "%";

        default:
          return "";
      }
    } catch (error) {
      return "";
    }
  };

  // Ajouter un nouvel ASPI
  const addNewAspi = () => {
    const { 
      type, 
      ausfallstunden, 
      arbeitsstunden, 
      year,
      meldepflichtigeUnfalle,
      unfalleVerletzungen,
      ausfalltageKrankheit,
      solltageGesamt
    } = newAspiData;
    
    // Validation des champs requis selon le type
    if (!year) {
      showNotification("Bitte geben Sie das Jahr ein!", "error");
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2019) {
      showNotification("Ungültiges Jahr! Bitte geben Sie ein Jahr ab 2019 ein.", "error");
      return;
    }

    let aspiValue = "";
    let notificationMessage = "";

    // Calcul selon le type d'ASPI
    switch (type) {
      case "ASPI 1":
        if (!ausfallstunden || !arbeitsstunden) {
          showNotification("Bitte füllen Sie alle Felder für ASPI 1 aus!", "error");
          return;
        }
        const ausfall1 = parseFloat(ausfallstunden.replace(',', '.'));
        const arbeits1 = parseFloat(arbeitsstunden.replace(',', '.'));
        if (isNaN(ausfall1) || isNaN(arbeits1) || arbeits1 === 0) {
          showNotification("Ungültige Zahlenwerte für ASPI 1!", "error");
          return;
        }
        aspiValue = (ausfall1 / arbeits1 * 100).toFixed(2).replace('.', ',') + "%";
        notificationMessage = `ASPI 1 für ${year}: ${aspiValue}`;
        break;

      case "ASPI 2":
        if (!meldepflichtigeUnfalle || !arbeitsstunden) {
          showNotification("Bitte füllen Sie alle Felder für ASPI 2 aus!", "error");
          return;
        }
        const ausfall2 = parseFloat(meldepflichtigeUnfalle.replace(',', '.'));
        const arbeits2 = parseFloat(arbeitsstunden.replace(',', '.'));
        if (isNaN(ausfall2) || isNaN(arbeits2) || arbeits2 === 0) {
          showNotification("Ungültige Zahlenwerte für ASPI 2!", "error");
          return;
        }
        aspiValue = (ausfall2 / arbeits2 * 100).toFixed(2).replace('.', ',') + "%";
        notificationMessage = `ASPI 2 für ${year}: ${aspiValue}`;
        break;

      case "ASPI 3":
        if (!unfalleVerletzungen || !arbeitsstunden) {
          showNotification("Bitte füllen Sie alle Felder für ASPI 3 aus!", "error");
          return;
        }
        const unfalle = parseFloat(unfalleVerletzungen.replace(',', '.'));
        const arbeits3 = parseFloat(arbeitsstunden.replace(',', '.'));
        if (isNaN(unfalle) || isNaN(arbeits3) || arbeits3 === 0) {
          showNotification("Ungültige Zahlenwerte für ASPI 3!", "error");
          return;
        }
        aspiValue = (unfalle / arbeits3).toFixed(3).replace('.', ',');
        notificationMessage = `ASPI 3 für ${year}: ${aspiValue}`;
        break;

      case "ASPI 4":
        if (!ausfalltageKrankheit || !solltageGesamt) {
          showNotification("Bitte füllen Sie alle Felder für ASPI 4 aus!", "error");
          return;
        }
        const ausfalltage = parseFloat(ausfalltageKrankheit.replace(',', '.'));
        const solltage = parseFloat(solltageGesamt.replace(',', '.'));
        if (isNaN(ausfalltage) || isNaN(solltage) || solltage === 0) {
          showNotification("Ungültige Zahlenwerte für ASPI 4!", "error");
          return;
        }
        aspiValue = (ausfalltage / solltage * 100).toFixed(2).replace('.', ',') + "%";
        notificationMessage = `ASPI 4 für ${year}: ${aspiValue}`;
        break;

      default:
        showNotification("Ungültiger ASPI-Typ!", "error");
        return;
    }

    // Trouver l'index de la ligne correspondante
    const aspiIndex = tableData.findIndex(row => row.asp === type);
    if (aspiIndex === -1) {
      showNotification(`${type} nicht gefunden!`, "error");
      return;
    }

    // Trouver l'index de la colonne pour l'année
    const yearIndex = yearNum - 2019;
    
    // Ajouter de nouvelles colonnes si nécessaire
    const currentColumns = 7;
    const newColumnsNeeded = Math.max(0, yearIndex - currentColumns + 1);
    
    const newData = [...tableData];
    
    if (newColumnsNeeded > 0) {
      newData.forEach((row, index) => {
        const newValues = [...row.values];
        for (let i = 0; i < newColumnsNeeded; i++) {
          newValues.push("");
        }
        newData[index] = { ...row, values: newValues };
      });
    }

    // Mettre à jour la valeur
    newData[aspiIndex].values[yearIndex] = aspiValue;
    
    // Comparaison avec l'année précédente
    if (yearIndex > 0 && newData[aspiIndex].values[yearIndex - 1] && 
        newData[aspiIndex].values[yearIndex - 1] !== "") {
      const prevValueStr = newData[aspiIndex].values[yearIndex - 1];
      let prevValue, currentValue;

      if (type === "ASPI 3") {
        prevValue = parseFloat(prevValueStr.replace(',', '.'));
        currentValue = parseFloat(aspiValue.replace(',', '.'));
      } else {
        prevValue = parseFloat(prevValueStr.replace('%', '').replace(',', '.'));
        currentValue = parseFloat(aspiValue.replace('%', '').replace(',', '.'));
      }
      
      if (currentValue > prevValue) {
        showNotification(`Warnung: ${type} für ${year} (${aspiValue}) ist höher als im Vorjahr (${newData[aspiIndex].values[yearIndex - 1]}).`, "warning");
      } else {
        showNotification(`Gut gemacht: ${type} für ${year} (${aspiValue}) ist niedriger als im Vorjahr (${newData[aspiIndex].values[yearIndex - 1]}).`, "success");
      }
    } else {
      showNotification(notificationMessage, "success");
    }

    setTableData(newData);
    localStorage.setItem("qpiTableData", JSON.stringify(newData));
    setShowAddForm(false);
    setNewAspiData({
      type: "ASPI 1",
      ausfallstunden: "",
      arbeitsstunden: "",
      year: "",
      meldepflichtigeUnfalle: "",
      unfalleVerletzungen: "",
      ausfalltageKrankheit: "",
      solltageGesamt: ""
    });
  };

  return (
    <div className="container my-4" style={{ position: 'relative' }}>
      {/* Flou et assombrissement du contenu principal lorsque la boîte de dialogue est ouverte */}
      {showConfirmDialog && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
          borderRadius: '12px'
        }}></div>
      )}
      
      <h2 className="text-center mb-4" style={{ position: 'relative', zIndex: 1 }}>Qualitätskennzahlen - QPIs</h2>

      <div className="d-flex justify-content-end mb-3" style={{ position: 'relative', zIndex: 1 }}>
        <button 
          className="btn btn-success"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus me-2"></i>Neuen ASPI Wert hinzufügen
        </button>
      </div>

      <div className="table-responsive" style={{ position: 'relative', zIndex: 1 }}>
        <table className="table table-bordered align-middle shadow rounded-4 overflow-hidden text-center custom-table">
          <thead>
            <tr className="qpi-header">
              <th>ASPI</th>
              <th>Beschreibung</th>
              <th>Gesamt 2019</th>
              <th>Gesamt 2020</th>
              <th>Gesamt 2021</th>
              <th>Gesamt-Ø 2022</th>
              <th>Gesamt-Ø 2023</th>
              <th>Gesamt-Ø 2024</th>
              <th>Gesamt-Ø 2025</th>
              {/* Ajouter des colonnes supplémentaires si nécessaire */}
              {tableData[0]?.values.length > 7 && 
                Array.from({ length: tableData[0].values.length - 7 }, (_, i) => (
                  <th key={i}>{`Gesamt-Ø ${2026 + i}`}</th>
                ))
              }
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {editingRow === rowIndex ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editData.asp}
                        onChange={(e) => handleInputChange("asp", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </td>
                    {editData.values.map((value, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={value}
                          onChange={(e) => handleInputChange("values", e.target.value, true, colIndex)}
                        />
                      </td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                          <i className="fas fa-check me-1"></i> Speichern
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                          <i className="fas fa-times me-1"></i> Abbrechen
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{row.asp}</td>
                    <td>{row.description}</td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex}>{value}</td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleEdit(rowIndex)}
                        >
                          <i className="fas fa-edit me-1"></i> Bearbeiten
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleDeleteClick(rowIndex)}
                        >
                          <i className="fas fa-trash me-1"></i> Löschen
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulaire d'ajout d'un nouvel ASPI */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div className="modal-content shadow-lg border-0" style={{ 
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '700px'
          }}>
            <div className="modal-header" style={{ backgroundColor: '#3b7695', color: '#fff' }}>
              <h5 className="modal-title">
                <i className="fas fa-plus-circle me-2"></i>
                Neuen {newAspiData.type} Wert hinzufügen
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowAddForm(false)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label fw-bold">ASPI Typ</label>
                  <select
                    className="form-select"
                    value={newAspiData.type}
                    onChange={(e) => handleAddFormChange("type", e.target.value)}
                    style={{ borderColor: '#3b7695' }}
                  >
                    <option value="ASPI 1">ASPI 1</option>
                    <option value="ASPI 2">ASPI 2</option>
                    <option value="ASPI 3">ASPI 3</option>
                    <option value="ASPI 4">ASPI 4</option>
                  </select>
                </div>
              </div>

              {newAspiData.type === "ASPI 1" && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Ausfallstunden Krankheit</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.ausfallstunden}
                      onChange={(e) => handleAddFormChange("ausfallstunden", e.target.value)}
                      placeholder="z.B. 5000"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Arbeitsstunden gesamt</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.arbeitsstunden}
                      onChange={(e) => handleAddFormChange("arbeitsstunden", e.target.value)}
                      placeholder="z.B. 40000"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                </div>
              )}

              {newAspiData.type === "ASPI 2" && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Ausfallstunden Meldepflichtige Unfälle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.meldepflichtigeUnfalle}
                      onChange={(e) => handleAddFormChange("meldepflichtigeUnfalle", e.target.value)}
                      placeholder="z.B. 250"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Arbeitsstunden gesamt</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.arbeitsstunden}
                      onChange={(e) => handleAddFormChange("arbeitsstunden", e.target.value)}
                      placeholder="z.B. 40000"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                </div>
              )}

              {newAspiData.type === "ASPI 3" && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Übersicht Unfälle und Verletzungen</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.unfalleVerletzungen}
                      onChange={(e) => handleAddFormChange("unfalleVerletzungen", e.target.value)}
                      placeholder="z.B. 3,5"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Arbeitsstunden gesamt</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.arbeitsstunden}
                      onChange={(e) => handleAddFormChange("arbeitsstunden", e.target.value)}
                      placeholder="z.B. 40000"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                </div>
              )}

              {newAspiData.type === "ASPI 4" && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Ausfalltage Krankheit gesamt</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.ausfalltageKrankheit}
                      onChange={(e) => handleAddFormChange("ausfalltageKrankheit", e.target.value)}
                      placeholder="z.B. 1200"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Solltage gesamt</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAspiData.solltageGesamt}
                      onChange={(e) => handleAddFormChange("solltageGesamt", e.target.value)}
                      placeholder="z.B. 8000"
                      style={{ borderColor: '#3b7695' }}
                    />
                  </div>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label fw-bold">Jahr</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newAspiData.year}
                    onChange={(e) => handleAddFormChange("year", e.target.value)}
                    placeholder="z.B. 2026, 2027, 2028..."
                    min="2019"
                    style={{ borderColor: '#3b7695' }}
                  />
                  <div className="form-text">Geben Sie das Jahr für die Berechnung ein (ab 2019)</div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="fw-bold" style={{ color: '#3b7695' }}>Berechnungsformel:</h6>
                {newAspiData.type === "ASPI 1" && (
                  <p className="mb-0">ASPI 1 = (Ausfallstunden Krankheit / Arbeitsstunden gesamt) × 100</p>
                )}
                {newAspiData.type === "ASPI 2" && (
                  <p className="mb-0">ASPI 2 = (Ausfallstunden Meldepflichtige Unfälle / Arbeitsstunden gesamt) × 100</p>
                )}
                {newAspiData.type === "ASPI 3" && (
                  <p className="mb-0">ASPI 3 = (Übersicht Unfälle und Verletzungen / Arbeitsstunden gesamt)</p>
                )}
                {newAspiData.type === "ASPI 4" && (
                  <p className="mb-0">ASPI 4 = (Ausfalltage Krankheit gesamt / Solltage gesamt) × 100</p>
                )}
                
                {calculateRealTimeValue() && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong style={{ color: '#3b7695' }}>Aktuelle Berechnung:</strong><br />
                    {newAspiData.type === "ASPI 1" && (
                      <span>({newAspiData.ausfallstunden} / {newAspiData.arbeitsstunden}) × 100 = {calculateRealTimeValue()}</span>
                    )}
                    {newAspiData.type === "ASPI 2" && (
                      <span>({newAspiData.meldepflichtigeUnfalle} / {newAspiData.arbeitsstunden}) × 100 = {calculateRealTimeValue()}</span>
                    )}
                    {newAspiData.type === "ASPI 3" && (
                      <span>({newAspiData.unfalleVerletzungen} / {newAspiData.arbeitsstunden}) = {calculateRealTimeValue()}</span>
                    )}
                    {newAspiData.type === "ASPI 4" && (
                      <span>({newAspiData.ausfalltageKrankheit} / {newAspiData.solltageGesamt}) × 100 = {calculateRealTimeValue()}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', padding: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary me-3" 
                onClick={() => setShowAddForm(false)}
                style={{ padding: '0.5rem 1.5rem' }}
              >
                <i className="fas fa-times me-1"></i> Abbrechen
              </button>
              <button 
                type="button" 
                className="btn text-white" 
                onClick={addNewAspi}
                style={{ 
                  backgroundColor: '#3b7695', 
                  borderColor: '#3b7695',
                  padding: '0.5rem 1.5rem'
                }}
              >
                <i className="fas fa-calculator me-1"></i> Berechnen und Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1060
        }}>
          <div className="modal-content shadow-lg border-0" style={{ 
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div className="modal-header" style={{ backgroundColor: '#3b7695', color: '#fff' }}>
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Bestätigung erforderlich
              </h5>
            </div>
            <div className="modal-body p-4">
              <p className="mb-0 fs-5">Möchten Sie diese Zeile wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-lg me-3" 
                onClick={cancelDelete}
              >
                <i className="fas fa-times me-1"></i> Abbrechen
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-lg" 
                onClick={confirmDelete}
              >
                <i className="fas fa-trash me-1"></i> Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification centrée avec icônes professionnelles */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1070,
          minWidth: '400px',
          maxWidth: '90%'
        }}>
          <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center shadow-lg`} style={{
            borderRadius: '10px',
            border: 'none'
          }}>
            {notification.type === 'success' && (
              <i className="fas fa-check-circle fa-2x me-3"></i>
            )}
            {notification.type === 'warning' && (
              <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
            )}
            {notification.type === 'error' && (
              <i className="fas fa-times-circle fa-2x me-3"></i>
            )}
            {notification.type === 'info' && (
              <i className="fas fa-info-circle fa-2x me-3"></i>
            )}
            <div className="flex-grow-1">
              {notification.message}
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setNotification({ show: false, message: "", type: "" })}
            ></button>
          </div>
        </div>
      )}

      {/* Style interne */}
      <style jsx>{`
        .qpi-header th {
          background: linear-gradient(135deg, #3b7695, #2a5c7c) !important;
          color: #fff !important;
          font-weight: 600;
          border: none;
          padding: 12px 8px;
        }
        .custom-table {
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #dee2e6;
        }
        .custom-table th, 
        .custom-table td {
          border: 1px solid #dee2e6;
          vertical-align: middle;
        }
        .custom-table tbody tr:hover {
          background-color: rgba(59, 118, 149, 0.05);
        }
        input.form-control {
          text-align: center;
          padding: 0.25rem;
          font-size: 0.875rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        input.form-control:focus {
          border-color: #3b7695;
          box-shadow: 0 0 0 0.2rem rgba(59, 118, 149, 0.25);
        }
        .btn {
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>

      {/* Inclure Font Awesome pour les icônes */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

export default QpiTable;
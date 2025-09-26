import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Tag,
  Space,
  notification,
  Divider,
  Row,
  Col,
  Statistic,
  Tooltip,
  Popconfirm
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalculatorOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  CalendarOutlined,
  PercentageOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  AlertOutlined,
  RiseOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const AspiTable = () => {
  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
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
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

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

  // Calculer la moyenne pour un ASPI spécifique
  const calculateAverageForAspi = (aspiType) => {
    const aspiData = tableData.find(item => item.asp === aspiType);
    if (!aspiData) return { average: 0, count: 0 };

    const validValues = aspiData.values.filter(value => {
      if (!value || value === "-" || value === "") return false;
      
      if (aspiType === "ASPI 3") {
        const numValue = parseFloat(value.replace(',', '.'));
        return !isNaN(numValue);
      } else {
        const numValue = parseFloat(value.replace('%', '').replace(',', '.'));
        return !isNaN(numValue);
      }
    });

    if (validValues.length === 0) return { average: 0, count: 0 };

    const sum = validValues.reduce((acc, value) => {
      if (aspiType === "ASPI 3") {
        return acc + parseFloat(value.replace(',', '.'));
      } else {
        return acc + parseFloat(value.replace('%', '').replace(',', '.'));
      }
    }, 0);

    return {
      average: (sum / validValues.length).toFixed(aspiType === "ASPI 3" ? 3 : 2),
      count: validValues.length
    };
  };

  // Obtenir la couleur et l'icône pour chaque ASPI
  const getAspiConfig = (aspiType) => {
    const configs = {
      "ASPI 1": {
        color: "#52c41a", // Vert
        icon: <HeartOutlined />,
        title: "Durchschnitt ASPI 1"
      },
      "ASPI 2": {
        color: "#faad14", // Orange
        icon: <AlertOutlined />,
        title: "Durchschnitt ASPI 2"
      },
      "ASPI 3": {
        color: "#f5222d", // Rouge
        icon: <SafetyCertificateOutlined />,
        title: "Durchschnitt ASPI 3"
      },
      "ASPI 4": {
        color: "#1890ff", // Bleu
        icon: <RiseOutlined />,
        title: "Durchschnitt ASPI 4"
      }
    };
    return configs[aspiType] || { color: "#3b7695", icon: <BarChartOutlined /> };
  };

  // Afficher une notification Ant Design
  const showNotification = (message, type = "info") => {
    notification[type]({
      message: type === "success" ? "Erfolg" : type === "error" ? "Fehler" : "Info",
      description: message,
      placement: "topRight",
      duration: 5,
    });
  };

  // Activer le mode édition pour une ligne
  const handleEdit = (record) => {
    setEditingRow(record.id);
    setEditData({ ...record });
    form.setFieldsValue(record);
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
    form.resetFields();
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      const newData = tableData.map(item => 
        item.id === editingRow ? { ...item, ...values } : item
      );
      setTableData(newData);
      localStorage.setItem("qpiTableData", JSON.stringify(newData));
      setEditingRow(null);
      setEditData({});
      showNotification("Änderungen erfolgreich gespeichert!", "success");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Confirmer la suppression
  const confirmDelete = (record) => {
    const newData = tableData.filter(item => item.id !== record.id);
    setTableData(newData);
    localStorage.setItem("qpiTableData", JSON.stringify(newData));
    showNotification("ASPI erfolgreich gelöscht!", "success");
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
          if (!ausfallstunden || !arbeitsstunden) return null;
          const ausfall1 = parseFloat(ausfallstunden.replace(',', '.'));
          const arbeits1 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(ausfall1) || isNaN(arbeits1) || arbeits1 === 0) return null;
          return (ausfall1 / arbeits1 * 100).toFixed(2).replace('.', ',') + "%";

        case "ASPI 2":
          if (!meldepflichtigeUnfalle || !arbeitsstunden) return null;
          const ausfall2 = parseFloat(meldepflichtigeUnfalle.replace(',', '.'));
          const arbeits2 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(ausfall2) || isNaN(arbeits2) || arbeits2 === 0) return null;
          return (ausfall2 / arbeits2 * 100).toFixed(2).replace('.', ',') + "%";

        case "ASPI 3":
          if (!unfalleVerletzungen || !arbeitsstunden) return null;
          const unfalle = parseFloat(unfalleVerletzungen.replace(',', '.'));
          const arbeits3 = parseFloat(arbeitsstunden.replace(',', '.'));
          if (isNaN(unfalle) || isNaN(arbeits3) || arbeits3 === 0) return null;
          return (unfalle / arbeits3).toFixed(3).replace('.', ',');

        case "ASPI 4":
          if (!ausfalltageKrankheit || !solltageGesamt) return null;
          const ausfalltage = parseFloat(ausfalltageKrankheit.replace(',', '.'));
          const solltage = parseFloat(solltageGesamt.replace(',', '.'));
          if (isNaN(ausfalltage) || isNaN(solltage) || solltage === 0) return null;
          return (ausfalltage / solltage * 100).toFixed(2).replace('.', ',') + "%";

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Ajouter un nouvel ASPI
  const addNewAspi = async () => {
    try {
      const values = await addForm.validateFields();
      const { 
        type, 
        ausfallstunden, 
        arbeitsstunden, 
        year,
        meldepflichtigeUnfalle,
        unfalleVerletzungen,
        ausfalltageKrankheit,
        solltageGesamt
      } = values;
      
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
      addForm.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Colonnes pour le tableau Ant Design
  const columns = [
    {
      title: 'ASPI',
      dataIndex: 'asp',
      key: 'asp',
      width: 100,
      render: (text, record) => {
        const config = getAspiConfig(text);
        return (
          editingRow === record.id ? (
            <Form.Item name="asp" style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          ) : (
            <Tag color={config.color} style={{ 
              fontSize: '14px', 
              padding: '4px 8px',
              color: 'white',
              border: 'none'
            }}>
              {text}
            </Tag>
          )
        );
      },
    },
    {
      title: 'Beschreibung',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        editingRow === record.id ? (
          <Form.Item name="description" style={{ margin: 0 }}>
            <TextArea rows={2} />
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    // Colonnes pour les années
    ...Array.from({ length: Math.max(7, tableData[0]?.values?.length || 0) }, (_, i) => ({
      title: `Gesamt-Ø ${2019 + i}`,
      dataIndex: 'values',
      key: `year-${2019 + i}`,
      width: 120,
      render: (values, record) => (
        editingRow === record.id ? (
          <Form.Item name={['values', i]} style={{ margin: 0 }}>
            <Input />
          </Form.Item>
        ) : (
          values[i] || '-'
        )
      ),
    })),
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {editingRow === record.id ? (
            <>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={handleSaveEdit}
                size="small"
                style={{ backgroundColor: '#3b7695', borderColor: '#3b7695' }}
              />
              <Button 
                icon={<WarningOutlined />} 
                onClick={handleCancelEdit}
                size="small"
              />
            </>
          ) : (
            <>
              <Tooltip title="Bearbeiten">
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEdit(record)}
                  size="small"
                  style={{ backgroundColor: '#3b7695', borderColor: '#3b7695' }}
                />
              </Tooltip>
              <Tooltip title="Löschen">
                <Popconfirm
                  title="ASPI löschen"
                  description="Sind Sie sicher, dass Sie diesen ASPI löschen möchten?"
                  onConfirm={() => confirmDelete(record)}
                  okText="Ja"
                  cancelText="Nein"
                  icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                >
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const realTimeValue = calculateRealTimeValue();

  // Calculer les moyennes pour tous les ASPI
  const aspiAverages = [
    { type: "ASPI 1", ...calculateAverageForAspi("ASPI 1") },
    { type: "ASPI 2", ...calculateAverageForAspi("ASPI 2") },
    { type: "ASPI 3", ...calculateAverageForAspi("ASPI 3") },
    { type: "ASPI 4", ...calculateAverageForAspi("ASPI 4") }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Partie 1: En-tête avec statistiques et bouton d'ajout */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `2px solid #3b7695`
        }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} md={16}>
            <h1 style={{ 
              margin: 0, 
              color: '#3b7695',
              fontSize: '28px',
              fontWeight: 600
            }}>
              ASPI Management Dashboard
            </h1>
            <p style={{ 
              color: '#666',
              fontSize: '16px',
              margin: '8px 0 0 0'
            }}>
              Verwalten und überwachen Sie Ihre Arbeitsunfallstatistiken
            </p>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#3b7695',
                borderColor: '#3b7695',
                borderRadius: '8px',
                height: '48px',
                padding: '0 24px',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Neuen ASPI Wert hinzufügen
            </Button>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#3b7695' }} />

        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Statistic
              title="Total ASPI Types"
              value={tableData.length}
              prefix={<BarChartOutlined style={{ color: '#3b7695' }} />}
              valueStyle={{ color: '#3b7695' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Aktive Jahre"
              value={Math.max(7, tableData[0]?.values?.length || 0)}
              suffix="Jahre"
              prefix={<CalendarOutlined style={{ color: '#3b7695' }} />}
              valueStyle={{ color: '#3b7695' }}
            />
          </Col>
          
          {/* Moyennes pour chaque ASPI */}
          {aspiAverages.map((aspi, index) => {
            const config = getAspiConfig(aspi.type);
            return (
              <Col xs={24} sm={6} key={aspi.type}>
                <Statistic
                  title={config.title}
                  value={aspi.average}
                  suffix={aspi.type !== "ASPI 3" ? "%" : ""}
                  prefix={React.cloneElement(config.icon, { style: { color: config.color } })}
                  valueStyle={{ color: config.color }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '-8px' }}>
                  {aspi.count} Werte
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Partie 2: Tableau des données */}
      <Card
        title={
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#3b7695' }}>
            <CalculatorOutlined style={{ marginRight: '8px', color: '#3b7695' }} />
            ASPI Übersichtstabelle
          </span>
        }
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `2px solid #3b7695`
        }}
        extra={
          <Tooltip title="Daten werden automatisch im Browser gespeichert">
            <InfoCircleOutlined style={{ color: '#3b7695', fontSize: '16px' }} />
          </Tooltip>
        }
      >
        <Form form={form} component={false}>
          <Table
            columns={columns}
            dataSource={tableData.map(item => ({ ...item, key: item.id }))}
            pagination={false}
            scroll={{ x: 1200 }}
            bordered
            size="middle"
          />
        </Form>
      </Card>

      {/* Modal d'ajout d'un nouvel ASPI */}
      <Modal
        title={
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#3b7695' }}>
            <PlusOutlined style={{ marginRight: '8px', color: '#3b7695' }} />
            Neuen {newAspiData.type} Wert hinzufügen
          </span>
        }
        open={showAddForm}
        onCancel={() => {
          setShowAddForm(false);
          addForm.resetFields();
        }}
        footer={null}
        width={700}
        style={{ borderRadius: '12px' }}
      >
        <Form
          form={addForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => {
            setNewAspiData(allValues);
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="type"
                label="ASPI Typ"
                rules={[{ required: true, message: 'Bitte wählen Sie einen ASPI Typ' }]}
              >
                <Select size="large" style={{ borderColor: '#3b7695' }}>
                  <Option value="ASPI 1">ASPI 1</Option>
                  <Option value="ASPI 2">ASPI 2</Option>
                  <Option value="ASPI 3">ASPI 3</Option>
                  <Option value="ASPI 4">ASPI 4</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate={(prev, current) => prev.type !== current.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const config = getAspiConfig(type);
              
              return (
                <>
                  {type === "ASPI 1" && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="ausfallstunden"
                          label="Ausfallstunden Krankheit"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 5000" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="arbeitsstunden"
                          label="Arbeitsstunden gesamt"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 40000" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {type === "ASPI 2" && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="meldepflichtigeUnfalle"
                          label="Ausfallstunden Meldepflichtige Unfälle"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 250" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="arbeitsstunden"
                          label="Arbeitsstunden gesamt"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 40000" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {type === "ASPI 3" && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="unfalleVerletzungen"
                          label="Übersicht Unfälle und Verletzungen"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 3,5" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="arbeitsstunden"
                          label="Arbeitsstunden gesamt"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 40000" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {type === "ASPI 4" && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="ausfalltageKrankheit"
                          label="Ausfalltage Krankheit gesamt"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 1200" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="solltageGesamt"
                          label="Solltage gesamt"
                          rules={[{ required: true, message: 'Dieses Feld ist erforderlich' }]}
                        >
                          <Input placeholder="z.B. 8000" size="large" style={{ borderColor: config.color }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="year"
                label="Jahr"
                rules={[
                  { required: true, message: 'Bitte geben Sie das Jahr ein' },
                  { pattern: /^(201[9-9]|20[2-9][0-9])$/, message: 'Ungültiges Jahr (ab 2019)' }
                ]}
              >
                <Input placeholder="z.B. 2026, 2027, 2028..." size="large" style={{ borderColor: '#3b7695' }} />
              </Form.Item>
            </Col>
          </Row>

          {realTimeValue && (
            <Card 
              size="small" 
              style={{ 
                marginBottom: 16,
                borderColor: '#3b7695',
                background: '#f0f8ff'
              }}
            >
              <Statistic
                title="Aktuelle Berechnung"
                value={realTimeValue}
                valueStyle={{ color: '#3b7695', fontSize: '24px' }}
                prefix={<CalculatorOutlined style={{ color: '#3b7695' }} />}
              />
            </Card>
          )}

          <Divider style={{ borderColor: '#3b7695' }} />

          <div style={{ textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setShowAddForm(false);
                addForm.resetFields();
              }}
              style={{ marginRight: 8 }}
              size="large"
            >
              Abbrechen
            </Button>
            <Button 
              type="primary" 
              onClick={addNewAspi}
              icon={<CalculatorOutlined />}
              size="large"
              style={{
                backgroundColor: '#3b7695',
                borderColor: '#3b7695'
              }}
            >
              Berechnen und Hinzufügen
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AspiTable;
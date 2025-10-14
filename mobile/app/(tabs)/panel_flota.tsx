// app/(tabs)/panel_flota.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


// --- PALETA DE COLORES OPTIMIZADA (COHERENTE CON LOGO ROJO/NARANJA) ---
const COLORS = {
  mainBackground: '#101014', 
  cardBackground: '#1A1A22', 
  inputBackground: '#121218', 
  inputBorder: '#3A4048', 
  orange: '#FF6600', 
  red: '#DA291C', 
  white: '#FFFFFF', 
  lightGray: '#AAAAAA', 
  tableHeader: '#3A4048', // Un gris más fuerte para los encabezados
  success: '#3CB371', // Verde suave para Excel
  modalBackground: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente del modal
};

// --- DATOS SIMULADOS ---
type RecordType = {
    id: number;
    fecha: string;
    patente: string;
    conductor: string;
    tripulacion: string;
    ausente: string;
    rut: string;
};

const MOCK_RECORDS: RecordType[] = [
    { 
        id: 1, 
        fecha: "2024-10-12 08:15", 
        patente: "GH-JK-12", 
        conductor: "Juan Pérez (Operario)", 
        tripulacion: "Pedro Guerrero Barria, Osvaldo Ojeda", 
        ausente: "Ninguno",
        rut: "12.345.678-9"
    },
    { 
        id: 2, 
        fecha: "2024-10-12 09:00", 
        patente: "PL-MN-34", 
        conductor: "María Soto (Conductor)", 
        tripulacion: "Daniel Alvaro Delgado, Luis Gonzalez Talma", 
        ausente: "Claudio Sanhueza (Vacaciones)",
        rut: "13.456.789-0"
    },
    { 
        id: 3, 
        fecha: "2024-10-11 17:30", 
        patente: "ZX-CV-56", 
        conductor: "Hernán Rojas (Supervisor)", 
        tripulacion: "Hermi Vargas Garriel", 
        ausente: "Osvaldo Ojeda (Enfermo)",
        rut: "14.567.890-1"
    },
];

// Definición de las columnas de la tabla
const COLUMNS = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'patente', label: 'Patente' },
    { key: 'conductor', label: 'Conductor' },
    { key: 'ausente', label: 'Ausente' },
];

// --- COMPONENTE DE ALERTA PERSONALIZADA (Reutilizado) ---
interface AlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'info' | 'details';
  // Detalles específicos solo para el modal de detalles
  recordDetails?: RecordType | null; 
}

const CustomAlert: React.FC<AlertProps> = ({ isVisible, onClose, title, message, type, recordDetails = null }) => {
  const color = type === 'success' ? COLORS.success : (type === 'info' ? COLORS.orange : COLORS.orange);
  const iconName = type === 'success' ? 'check-circle' : 'information';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible} //👈 Propiedad CLAVE: El Modal solo se muestra si `visible` es true.
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertBoxCustom}>
          <MaterialCommunityIcons name={iconName} size={36} color={color} style={{ marginBottom: 10 }} />
          
          <Text style={[styles.alertTitle, { color: color }]}>
            {title}
          </Text>
          
          {/* Contenido estándar del modal (para exportar) */}
          {type !== 'details' && (
             <Text style={styles.alertMessage}>{message}</Text>
          )}

          {/* Contenido especial para detalles de registro */}
          {type === 'details' && recordDetails && (
              <ScrollView style={{ maxHeight: 300, paddingVertical: 10 }}>
                <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>RUT:</Text> {recordDetails.rut}
                </Text>
                <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Patente:</Text> {recordDetails.patente}
                </Text>
                <Text style={styles.detailLabel}>Tripulación Completa:</Text>
                {recordDetails.tripulacion.split(', ').map((n, i) => (
                    <Text key={i} style={styles.detailItem}>- {n}</Text>
                ))}
                <Text style={styles.detailLabel}>Ausente/Motivo:</Text>
                <Text style={styles.detailItem}>{recordDetails.ausente}</Text>
              </ScrollView>
          )}
          
          <TouchableOpacity style={[styles.alertButton, { backgroundColor: color, marginTop: type === 'details' ? 15 : 30 }]} onPress={onClose}>
            <Text style={styles.alertButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
// --- FIN COMPONENTE DE ALERTA PERSONALIZADA ---


// --- COMPONENTE PRINCIPAL ---
export default function PanelFlota() {
    
    // 🚨 ESTADOS PARA EL MODAL DE ALERTA 🚨
    const [showAlert, setShowAlert] = useState(false);
    const [alertContent, setAlertContent] = useState({ 
        title: '', 
        message: '', 
        type: 'info' as 'success' | 'info' | 'details',
        record: null as RecordType | null,
    });

    // Función de simulación para exportar
    const handleExport = () => {
        // Mostrar Alerta de INFO usando el modal
        setAlertContent({
            title: "Función de Exportación",
            message: "La funcionalidad para exportar a Excel no está implementada aún. ¡Próximamente! Utiliza el botón de 'Detalle' para ver los datos.",
            type: 'info',
            record: null,
        });
        setShowAlert(true);
    };

    // Función para mostrar detalles completos del registro
    const showDetails = (record: RecordType) => {
        setAlertContent({
            title: `Registro de Patente: ${record.patente}`,
            message: "", // No se usa el mensaje estándar
            type: 'details',
            record: record,
        });
        setShowAlert(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel de Control</Text>
            <Text style={styles.subtitle}>
                Registros de Tripulación enviados por los conductores. 
                <Text style={{ fontWeight: 'bold', color: COLORS.orange }}> {MOCK_RECORDS.length}</Text> Registros totales.
            </Text>

            {/* BOTÓN DE EXPORTAR */}
            <TouchableOpacity style={styles.exportButton} onPress={handleExport} activeOpacity={0.8}>
                <MaterialCommunityIcons name="microsoft-excel" size={24} color={COLORS.white} />
                <Text style={styles.exportButtonText}>Exportar a Excel</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Historial de Registros</Text>
                
                {/* Contenedor para la tabla scrollable */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.tableScrollContainer}
                >
                    <View>
                        {/* ENCABEZADO DE LA TABLA */}
                        <View style={styles.tableHeaderRow}>
                            {COLUMNS.map(col => (
                                <Text key={col.key} style={styles.tableHeaderCell}>
                                    {col.label}
                                </Text>
                            ))}
                            {/* Columna de Acción */}
                            <Text style={styles.tableHeaderCellAction}>
                                Detalle
                            </Text>
                        </View>

                        {/* FILAS DE DATOS */}
                        {MOCK_RECORDS.map((record, index) => (
                            <TouchableOpacity 
                                key={record.id} 
                                style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
                                onPress={() => showDetails(record)}
                                activeOpacity={0.7}
                            >
                                {COLUMNS.map(col => (
                                    <Text key={`${record.id}-${col.key}`} style={styles.tableDataCell}>
                                        {/* @ts-ignore: Acceder al índice de la columna */}
                                        {record[col.key]}
                                    </Text>
                                ))}
                                {/* Columna de Acción (Botón de Ver Detalles) */}
                                <View style={styles.tableDataCellAction}>
                                    <MaterialCommunityIcons 
                                        name="file-eye-outline" 
                                        size={22} 
                                        color={COLORS.orange} 
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <Text style={styles.footerText}>Toca cualquier registro para ver los detalles de la tripulación completa.</Text>
            </View>
            
            {/* 🚨 INTEGRACIÓN DEL MODAL 🚨 */}
            <CustomAlert
                isVisible={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertContent.title}
                message={alertContent.message}
                type={alertContent.type}
                recordDetails={alertContent.record}
            />
        </View>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.mainBackground,
        padding: 20,
    },
    title: { 
        fontSize: 26, 
        fontWeight: "bold", 
        marginTop: 10,
        color: COLORS.white
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.lightGray,
        marginBottom: 20,
        fontWeight: '500',
    },
    card: {
        backgroundColor: COLORS.cardBackground, 
        borderRadius: 12, 
        padding: 15,
        marginTop: 15,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, 
        shadowRadius: 8,
        elevation: 5,
        flex: 1, 
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    exportButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.success, // Verde para la acción de Excel
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: COLORS.success,
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    exportButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    // --- ESTILOS DE TABLA ---
    tableScrollContainer: {
        paddingRight: 15, 
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.tableHeader,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.orange,
    },
    tableHeaderCell: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
        width: 120, 
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    tableHeaderCellAction: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
        width: 60, 
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBorder,
    },
    evenRow: {
        backgroundColor: COLORS.inputBackground, 
    },
    oddRow: {
        backgroundColor: COLORS.cardBackground, 
    },
    tableDataCell: {
        color: COLORS.lightGray,
        fontSize: 12,
        width: 120,
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    tableDataCellAction: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.lightGray,
        textAlign: 'center',
        marginTop: 10,
    },
    // --- ESTILOS DEL MODAL PERSONALIZADO ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.modalBackground,
    },
    alertBoxCustom: {
        width: '85%',
        backgroundColor: COLORS.cardBackground,
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        shadowColor: COLORS.white,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    alertTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        color: COLORS.lightGray,
        marginBottom: 30,
        textAlign: 'center',
    },
    alertButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    alertButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos para el modal de detalles del registro
    detailRow: {
        fontSize: 16,
        color: COLORS.white,
        marginBottom: 5,
        width: '100%',
    },
    detailLabel: {
        fontWeight: 'bold',
        color: COLORS.orange,
        marginTop: 10,
    },
    detailItem: {
        fontSize: 15,
        color: COLORS.lightGray,
        marginLeft: 15,
        marginBottom: 3,
    }
});

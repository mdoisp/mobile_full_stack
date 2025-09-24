import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentDTO } from '@/api/client';

type RootStackParamList = {
  StudentView: { student: StudentDTO };
};

type Props = NativeStackScreenProps<RootStackParamList, 'StudentView'>;

export default function ViewScreen({ route }: Props) {
  const { student } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{student.name}</Text>
      <Text style={styles.item}>RA: {student.studentId}</Text>
      <Text style={styles.item}>CEP: {student.address.zipcode}</Text>
      <Text style={styles.item}>Rua: {student.address.street}</Text>
      <Text style={styles.item}>Bairro: {student.address.neighborhood}</Text>
      <Text style={styles.item}>Cidade: {student.address.city} - {student.address.state}</Text>
      <Text style={[styles.item, { marginTop: 12 }]}>Courses: {student.courses?.join(', ') || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  item: { marginTop: 6 },
});



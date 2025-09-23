import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { createStudent, updateStudent, StudentDTO } from '@/api/client';

type RootStackParamList = {
  Students: undefined;
  StudentForm: { existing?: StudentDTO } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'StudentForm'>;

export default function FormScreen({ navigation, route }: Props) {
  const editing = Boolean(route.params?.existing);
  const [form, setForm] = useState<StudentDTO>(
    route.params?.existing ?? {
      studentId: '',
      name: '',
      address: { zipcode: '', street: '', neighborhood: '', city: '', state: '' },
      courses: [],
    }
  );

  const canSubmit = useMemo(() => {
    return (
      !!form.studentId &&
      !!form.name &&
      !!form.address.zipcode &&
      !!form.address.street &&
      !!form.address.neighborhood &&
      !!form.address.city &&
      !!form.address.state
    );
  }, [form]);

  const handleViaCep = async () => {
    const cep = form.address.zipcode.replace(/\D/g, '');
    if (cep.length !== 8) {
      Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        Alert.alert('CEP não encontrado');
        return;
      }
      setForm((prev) => ({
        ...prev,
        address: {
          zipcode: cep,
          street: data.logradouro || prev.address.street,
          neighborhood: data.bairro || prev.address.neighborhood,
          city: data.localidade || prev.address.city,
          state: data.uf || prev.address.state,
        },
      }));
    } catch (e) {
      Alert.alert('Erro', 'Falha ao consultar o viaCEP');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editing && form._id) {
        const { _id, ...payload } = form;
        await updateStudent(_id, payload as StudentDTO);
      } else {
        await createStudent(form);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  const updateField = (path: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev } as any;
      const keys = path.split('.');
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const [coursesInput, setCoursesInput] = useState('');
  useEffect(() => {
    if (editing && form.courses?.length) {
      setCoursesInput(form.courses.join(', '));
    }
  }, []);

  const onBlurCourses = () => {
    const arr = coursesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, courses: arr }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{editing ? 'Editar estudante' : 'Novo estudante'}</Text>

      <Text style={styles.label}>RA / studentId</Text>
      <TextInput style={styles.input} value={form.studentId} onChangeText={(t) => updateField('studentId', t)} placeholder="Ex.: 20250001" />

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(t) => updateField('name', t)} placeholder="Nome completo" />

      <Text style={[styles.label, { marginTop: 16 }]}>CEP</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[styles.input, { flex: 1 }]} keyboardType="number-pad" value={form.address.zipcode} onChangeText={(t) => updateField('address.zipcode', t)} placeholder="00000000" />
        <TouchableOpacity style={styles.btn} onPress={handleViaCep}>
          <Text style={styles.btnText}>viaCEP</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Rua</Text>
      <TextInput style={styles.input} value={form.address.street} onChangeText={(t) => updateField('address.street', t)} />

      <Text style={styles.label}>Bairro</Text>
      <TextInput style={styles.input} value={form.address.neighborhood} onChangeText={(t) => updateField('address.neighborhood', t)} />

      <Text style={styles.label}>Cidade</Text>
      <TextInput style={styles.input} value={form.address.city} onChangeText={(t) => updateField('address.city', t)} />

      <Text style={styles.label}>Estado</Text>
      <TextInput style={styles.input} value={form.address.state} onChangeText={(t) => updateField('address.state', t)} />

      <Text style={[styles.label, { marginTop: 16 }]}>Cursos (separados por vírgula)</Text>
      <TextInput style={styles.input} value={coursesInput} onChangeText={setCoursesInput} onBlur={onBlurCourses} placeholder="Ex.: Matemática, Inglês" />

      <TouchableOpacity style={[styles.btn, { marginTop: 24, backgroundColor: canSubmit ? '#0a7' : '#aaa' }]} onPress={handleSubmit} disabled={!canSubmit}>
        <Text style={styles.btnText}>{editing ? 'Salvar alterações' : 'Adicionar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 6 },
  btn: { backgroundColor: '#0a7', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});



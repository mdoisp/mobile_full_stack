import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { createStudent, updateStudent, StudentDTO, api } from '@/api/client';

type RootStackParamList = {
  Students: undefined;
  StudentForm: { existing?: StudentDTO } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'StudentForm'>;

export default function FormScreen({ navigation, route }: Props) {
  const editing = Boolean(route.params?.existing);
  const insets = useSafeAreaInsets();
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
      Alert.alert('Invalid CEP', 'Enter an 8-digit CEP.');
      return;
    }
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        Alert.alert('CEP not found');
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
      Alert.alert('Error', 'Failed to query viaCEP');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editing && form._id) {
        const { _id, ...payload } = form;
        await updateStudent(_id, payload as StudentDTO);
      } else {
        // Garante tipos/campos do payload conforme o Schema
        const payload: StudentDTO = {
          studentId: form.studentId.trim(),
          name: form.name.trim(),
          address: {
            zipcode: form.address.zipcode.trim(),
            street: form.address.street.trim(),
            neighborhood: form.address.neighborhood.trim(),
            city: form.address.city.trim(),
            state: form.address.state.trim(),
          },
          courses: (form.courses || []).map((c) => c.trim()).filter(Boolean),
        };
        await createStudent(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      const status = e?.response?.status;
      const backendMsg = e?.response?.data?.message;
      const msg = backendMsg || e?.message || 'Não foi possível salvar.';
      Alert.alert('Save failed', `${msg}${status ? ` (HTTP ${status})` : ''}`);
    }
  };

  const handlePing = async () => {
    try {
      const { data } = await api.get('/');
      Alert.alert('Success', typeof data === 'string' ? data : 'API OK');
    } catch (e: any) {
      const status = e?.response?.status;
      const backendMsg = e?.response?.data?.message;
      const msg = backendMsg || e?.message || 'Failed to connect';
      Alert.alert('Connection error', `${msg}${status ? ` (HTTP ${status})` : ''}`);
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
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + insets.bottom }]}>
      <Text style={styles.title}>{editing ? 'Edit student' : 'New student'}</Text>
      <TouchableOpacity onPress={handlePing} style={[styles.btn, { backgroundColor: '#555', alignSelf: 'flex-start', marginBottom: 12 }]}>
        <Text style={styles.btnText}>Test connection</Text>
      </TouchableOpacity>

      <Text style={styles.label}>RA / studentId</Text>
      <TextInput style={styles.input} value={form.studentId} onChangeText={(t) => updateField('studentId', t)} placeholder="Ex.: 20250001" />

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(t) => updateField('name', t)} placeholder="Full name" />

      <Text style={[styles.label, { marginTop: 16 }]}>CEP</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[styles.input, { flex: 1 }]} keyboardType="number-pad" value={form.address.zipcode} onChangeText={(t) => updateField('address.zipcode', t)} placeholder="00000000" />
        <TouchableOpacity style={styles.btn} onPress={handleViaCep}>
          <Text style={styles.btnText}>viaCEP</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Street</Text>
      <TextInput style={styles.input} value={form.address.street} onChangeText={(t) => updateField('address.street', t)} />

      <Text style={styles.label}>Neighborhood</Text>
      <TextInput style={styles.input} value={form.address.neighborhood} onChangeText={(t) => updateField('address.neighborhood', t)} />

      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={form.address.city} onChangeText={(t) => updateField('address.city', t)} />

      <Text style={styles.label}>State</Text>
      <TextInput style={styles.input} value={form.address.state} onChangeText={(t) => updateField('address.state', t)} />

      <Text style={[styles.label, { marginTop: 16 }]}>Courses (comma-separated)</Text>
      <TextInput style={styles.input} value={coursesInput} onChangeText={setCoursesInput} onBlur={onBlurCourses} placeholder="e.g., Math, English" />

      <TouchableOpacity style={[styles.btn, { marginTop: 24, marginBottom: insets.bottom, backgroundColor: canSubmit ? '#0a7' : '#aaa' }]} onPress={handleSubmit} disabled={!canSubmit}>
        <Text style={styles.btnText}>{editing ? 'Save changes' : 'Add'}</Text>
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



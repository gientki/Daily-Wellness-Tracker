import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { format } from 'date-fns';

const questions = [
  "Czy medytowałeś dzisiaj?",
  "Czy jadłeś zdrowe śniadanie?",
  "Czy spożyłeś 5 porcji warzyw/owoców?",
  "Czy unikałeś przetworzonej żywności?",
  "Czy piłeś wystarczającą ilość wody (≥2L)?",
  "Czy ćwiczyłeś przynajmniej 30 minut?",
  "Czy spacerowałeś na świeżym powietrzu?",
  "Czy wyspałeś się (≥7 godzin)?",
  "Czy unikałeś ekranów przed snem?",
  "Czy praktykowałeś wdzięczność?",
  "Czy spędzałeś czas z bliskimi?",
  "Czy unikałeś używek (alkohol, nikotyna)?",
  "Czy pracowałeś produktywnie?",
  "Czy uczyłeś się czegoś nowego?",
  "Czy poświęciłeś czas na hobby?",
  "Czy ograniczałeś czas w mediach społecznościowych?",
  "Czy wykonywałeć ćwiczenia oddechowe?",
  "Czy praktykowałeś post przerywany?",
  "Czy robiłeś przerwy w pracy?",
  "Czy zachowałeś work-life balance?"
];

export default function App() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(0));
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index] = newAnswers[index] === 1 ? 0 : 1;
    setAnswers(newAnswers);
  };

  const saveData = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const csvRow = [
      today,
      ...answers,
      mood,
      `"${notes.replace(/"/g, '""')}"`
    ].join(',');
    
    const csvHeader = [
      'date',
      ...questions.map((_, i) => `q${i+1}`),
      'mood',
      'notes'
    ].join(',');
    
    const fileName = 'wellness_data.csv';
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    try {
      // Sprawdź czy plik istnieje
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        // Jeśli nie, stwórz nowy z nagłówkiem
        await FileSystem.writeAsStringAsync(fileUri, `${csvHeader}\n${csvRow}\n`);
      } else {
        // Jeśli tak, dodaj nowy wiersz
        await FileSystem.writeAsStringAsync(fileUri, `${csvRow}\n`, { append: true });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Błąd przy zapisie: ' + error.message);
    }
  };

  const shareFile = async () => {
    const fileName = 'wellness_data.csv';
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        alert('Najpierw zapisz jakieś dane!');
        return;
      }
      
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      alert('Błąd przy udostępnianiu: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Daily Wellness Tracker</Text>
      <Text style={styles.date}>{format(new Date(), 'PPPP')}</Text>
      
      <View style={styles.questionsContainer}>
        {questions.map((question, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.questionButton,
              answers[index] === 1 && styles.answeredButton
            ]}
            onPress={() => toggleAnswer(index)}
          >
            <Text style={styles.questionText}>{question}</Text>
            <Text style={styles.answerText}>{answers[index] === 1 ? '✓ Tak' : '✗ Nie'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.moodContainer}>
        <Text style={styles.moodText}>Jak oceniasz swoje samopoczucie dzisiaj?</Text>
        <View style={styles.moodButtons}>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.moodButton,
                mood === num && styles.selectedMoodButton
              ]}
              onPress={() => setMood(num)}
            >
              <Text style={styles.moodButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TextInput
        style={styles.notesInput}
        multiline
        placeholder="Dodatkowe notatki (opcjonalne)"
        value={notes}
        onChangeText={setNotes}
      />
      
      <TouchableOpacity style={styles.saveButton} onPress={saveData}>
        <Text style={styles.saveButtonText}>Zapisz dzisiejsze dane</Text>
      </TouchableOpacity>
      
      {saved && <Text style={styles.savedText}>Zapisano pomyślnie!</Text>}
      
      <TouchableOpacity style={styles.shareButton} onPress={shareFile}>
        <Text style={styles.shareButtonText}>Udostępnij plik CSV</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  questionsContainer: {
    marginBottom: 20,
  },
  questionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  answeredButton: {
    backgroundColor: '#e0f7fa',
    borderColor: '#4dd0e1',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
  },
  answerText: {
    marginLeft: 10,
    color: '#666',
  },
  moodContainer: {
    marginBottom: 20,
  },
  moodText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedMoodButton: {
    backgroundColor: '#bbdefb',
    borderColor: '#2196f3',
  },
  moodButtonText: {
    fontSize: 20,
  },
  notesInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savedText: {
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
  },
  shareButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

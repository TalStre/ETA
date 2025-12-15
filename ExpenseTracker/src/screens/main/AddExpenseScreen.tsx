import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useCamera } from '../../hooks/useCamera';
import { useExpensesQuery } from '../../hooks/useExpensesQuery';

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', icon: '🛒' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { id: 'bills', label: 'Bills', icon: '📄' },
  { id: 'health', label: 'Health', icon: '💊' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'other', label: 'Other', icon: '📦' },
];

const AddExpenseScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const { image, showImagePickerOptions, removeImage, getBase64 } = useCamera();
  const { createExpense, isCreating } = useExpensesQuery();

  const handleSubmit = async () => {
  // Validation
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a title');
    return;
  }
  if (!amount || parseFloat(amount) <= 0) {
    Alert.alert('Error', 'Please enter a valid amount');
    return;
  }
  if (!category) {
    Alert.alert('Error', 'Please select a category');
    return;
  }

  try {
    // Create expense first
    const newExpense = await createExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
    });

    // Upload receipt if image exists
    if (image && getBase64 && newExpense) {
      try {
        const base64Data = getBase64();
        if (base64Data) {
          // Upload receipt (this is optional - won't fail expense creation)
          // await uploadReceipt(newExpense.id, base64Data, token);
          console.log('Receipt ready for upload:', image.fileName);
        }
      } catch (uploadError) {
        console.error('Receipt upload failed:', uploadError);
        // Continue anyway - expense was created successfully
      }
    }

    Alert.alert('Success', 'Expense added successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Reset form
          setTitle('');
          setAmount('');
          setCategory('');
          setDescription('');
          removeImage();
          navigation.goBack();
        },
      },
    ]);
  } catch (error) {
    Alert.alert('Error', 'Failed to add expense. Please try again.');
    console.error('Add expense error:', error);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Groceries"
            value={title}
            onChangeText={setTitle}
            editable={!isCreating}
          />
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!isCreating}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.id)}
                disabled={isCreating}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            editable={!isCreating}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Description Input (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this expense..."
            value={description}
            onChangeText={setDescription}
            editable={!isCreating}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Receipt Photo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Receipt Photo (Optional)</Text>
          
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.receiptImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
                disabled={isCreating}
              >
                <Text style={styles.removeImageText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={showImagePickerOptions}
              disabled={isCreating}
            >
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraButtonText}>Add Receipt Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Receipt Photo Section - Enhanced */}
<View style={styles.inputContainer}>
  <Text style={styles.label}>Receipt Photo (Optional)</Text>

  {image ? (
    <View style={styles.imagePreviewContainer}>
      <Image 
        source={{ uri: image.uri }} 
        style={styles.receiptImage}
        resizeMode="cover"
      />
      
      {/* Image Info */}
      <View style={styles.imageInfo}>
        <Text style={styles.imageInfoText}>
          📎 {image.fileName || 'receipt.jpg'}
        </Text>
        <Text style={styles.imageInfoText}>
          📏 {image.fileSize ? `${(image.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.imageActions}>
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={showImagePickerOptions}
          disabled={isCreating}
        >
          <Text style={styles.changeImageText}>🔄 Change</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={removeImage}
          disabled={isCreating}
        >
          <Text style={styles.removeImageText}>🗑️ Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <TouchableOpacity
      style={styles.cameraButton}
      onPress={showImagePickerOptions}
      disabled={isCreating}
    >
      <Text style={styles.cameraIcon}>📷</Text>
      <Text style={styles.cameraButtonText}>Add Receipt Photo</Text>
      <Text style={styles.cameraButtonSubtext}>Take photo or choose from gallery</Text>
    </TouchableOpacity>
  )}
</View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isCreating}
        >
          <Text style={styles.submitButtonText}>
            {isCreating ? 'Adding...' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  closeButton: {
    fontSize: 28,
    color: '#333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  cameraButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cameraButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imagePreviewContainer: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: '#ddd',
},
receiptImage: {
  width: '100%',
  height: 200,
  borderRadius: 8,
  backgroundColor: '#f0f0f0',
},
imageInfo: {
  marginTop: 12,
  padding: 8,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
},
imageInfoText: {
  fontSize: 12,
  color: '#666',
  marginVertical: 2,
},
imageActions: {
  flexDirection: 'row',
  marginTop: 12,
  gap: 12,
},
changeImageButton: {
  flex: 1,
  backgroundColor: '#007AFF',
  borderRadius: 8,
  padding: 12,
  alignItems: 'center',
},
changeImageText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
removeImageButton: {
  flex: 1,
  backgroundColor: '#FF3B30',
  borderRadius: 8,
  padding: 12,
  alignItems: 'center',
},
removeImageText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
cameraButtonSubtext: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
},
});

export default AddExpenseScreen;
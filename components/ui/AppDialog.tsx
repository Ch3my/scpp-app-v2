import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  FlatListProps
} from 'react-native';
import { useTheme } from '../../app/ScppThemeContext';

type AppDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  dismissable?: boolean;
};

type DialogTitleProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type DialogContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type DialogActionsProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type DialogScrollAreaProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type DialogListAreaProps<T> = FlatListProps<T> & {
  style?: ViewStyle;
};

export const AppDialog: React.FC<AppDialogProps> & {
  Title: React.FC<DialogTitleProps>;
  Content: React.FC<DialogContentProps>;
  Actions: React.FC<DialogActionsProps>;
  ScrollArea: React.FC<DialogScrollAreaProps>;
  ListArea: <T>(props: DialogListAreaProps<T>) => React.ReactElement;
} = ({ visible, onDismiss, children, dismissable = true }) => {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      <Pressable
        style={styles.overlay}
        onPress={dismissable ? onDismiss : undefined}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centeredView}
        >
          <Pressable
            style={[styles.dialog, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, style }) => {
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.titleContainer, style]}>
      <Text style={[styles.title, { color: colors.onSurface }]}>
        {children}
      </Text>
    </View>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

const DialogActions: React.FC<DialogActionsProps> = ({ children, style }) => {
  return <View style={[styles.actions, style]}>{children}</View>;
};

const DialogScrollArea: React.FC<DialogScrollAreaProps> = ({ children, style }) => {
  return (
    <ScrollView style={[styles.scrollArea, style]}>
      {children}
    </ScrollView>
  );
};

const DialogListArea = <T,>({ style, ...props }: DialogListAreaProps<T>) => {
  return (
    <FlatList
      style={[styles.listArea, style]}
      {...props}
    />
  );
};

AppDialog.Title = DialogTitle;
AppDialog.Content = DialogContent;
AppDialog.Actions = DialogActions;
AppDialog.ScrollArea = DialogScrollArea;
AppDialog.ListArea = DialogListArea;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dialog: {
    borderRadius: 28,
    minWidth: 280,
    maxWidth: '90%',
    maxHeight: '80%',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  scrollArea: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
  listArea: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
});

export default AppDialog;

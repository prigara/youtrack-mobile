import React, {View, ScrollView, PropTypes, Text, TouchableOpacity} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker/CalendarPicker/CalendarPicker';
import CustomField from '../custom-field/custom-field';
import Select from '../select/select';
import Header from '../header/header';
import {COLOR_PINK} from '../../components/variables/variables';

import styles from './custom-fields-panel.styles';

export default class CustomFieldsPanel extends React.Component {
  constructor() {
    super();

    this.state = {
      topCoord: 0,
      height: 0,
      editingField: null,

      select: {
        show: false,
        dataSource: null,
        onSelect: null,
        multi: false,
        selectedItems: []
      },

      datePicker: {
        show: false,
        title: null,
        value: null,
        onSelect: () => {
        }
      }
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.refs.panel.measure((fx, fy, width, height, px, py) => {
        this.setState({topCoord: py, height: height});
      });
    }, 0);
  }

  onSelectProject() {
    this.setState({
      select: {
        show: true,
        dataSource: this.props.api.getProjects.bind(this.props.api),
        onSelect: project => {
          this.closeEditor();
          return this.props.onUpdateProject(project);
        }
      }
    });
  }

  closeEditor() {
    return this.setState({editingField: null, datePicker: {show: false}, select: {show: false}});
  }

  onEditField(field) {
    if (field === this.state.editingField) {
      return this.closeEditor();
    }

    this.closeEditor();
    this.setState({editingField: field});

    if (field.projectCustomField.field.fieldType.valueType === 'date') {
      this.setState({
        datePicker: {
          show: true,
          title: field.projectCustomField.field.name,
          value: field.value ? new Date(field.value) : new Date(),
          emptyValueName: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
          onSelect: (date) => {
            this.closeEditor();
            return this.props.onUpdate(field, date ? date.getTime() : null);
          }
        }
      });
      return;
    }

    const isMultiValue = field.projectCustomField.field.fieldType.isMultiValue;
    let selectedItems = isMultiValue ? field.value : [field.value];
    selectedItems = selectedItems.filter(it => it !== null);

    this.setState({
      select: {
        show: true,
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        dataSource: (query) => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issue.id, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})))
          }
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType)
            .then(res => res.aggregatedUsers || res.values);
        },
        onSelect: (value) => {
          this.closeEditor();
          return this.props.onUpdate(field, value);
        }
      }
    });
  }

  _renderSelect() {
    if (!this.state.select.show) {
      return;
    }

    return <Select
      {...this.state.select}
      style={{
          top: -this.state.topCoord,
          bottom: this.state.height
        }}
      height={this.state.topCoord}
      title="Select item"
      api={this.props.api}
      onCancel={() => this.closeEditor()}
      getTitle={(item) => item.fullName || item.name || item.login}
    />;
  }

  _renderDatePicker() {
    if (!this.state.datePicker.show) {
      return;
    }

    return (
      <View style={[styles.datepickerViewContainer, {
          top: -this.state.topCoord,
          bottom: this.state.height
      }]}>
        <Header
          leftButton={<Text>Cancel</Text>}
          rightButton={<Text></Text>}
          onBack={() => this.closeEditor()}>
          <Text>{this.state.datePicker.title}</Text>
        </Header>
        <View style={styles.calendar}>
          {this.state.datePicker.emptyValueName &&
          <TouchableOpacity onPress={() => this.state.datePicker.onSelect(null)}>
            <Text style={styles.clearDate}>{this.state.datePicker.emptyValueName} (Clear value)</Text>
          </TouchableOpacity>}

          <CalendarPicker
            selectedDate={this.state.datePicker.value}
            startFromMonday={true}
            onDateChange={date => {
              if (this.state.datePicker.value.getMonth() !== date.getMonth()) {
                this.state.datePicker.value = date;
                return this.setState({datePicker: this.state.datePicker});
              }
              return this.state.datePicker.onSelect(date);
            }}
            selectedDayColor={COLOR_PINK}
            selectedDayTextColor="#FFF"/>
        </View>
      </View>
    );
  }

  render() {
    const issue = this.props.issue;

    return (
      <View ref="panel">
        {this._renderSelect()}

        {this._renderDatePicker()}

        <ScrollView horizontal={true} style={styles.customFieldsPanel}>
          <CustomField key="Project"
                       disabled={!this.props.canEditProject}
                       onPress={() => this.onSelectProject()}
                       field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>

          {issue.fields.map((field) => <CustomField
            key={field.id}
            field={field}
            onPress={() => this.onEditField(field)}
            active={this.state.editingField === field}
            disabled={!this.props.issuePermissions.canUpdateField(issue, field)}/>)}
        </ScrollView>
      </View>
    );
  }
}

CustomFieldsPanel.propTypes = {
  api: PropTypes.object.isRequired,
  issue: PropTypes.object.isRequired,
  issuePermissions: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUpdateProject: PropTypes.func,
  canEditProject: PropTypes.bool
};

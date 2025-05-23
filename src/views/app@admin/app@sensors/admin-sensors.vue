<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import AAdminKeyButton from "@/views/app@admin/app@sensors/a-admin-key-button.vue";
import axiosInstance from "@/plugins/axios";
import { showSuccess, showError } from "@/utils/notificationUtil";
import {SensorGroup, Sensor, Enum} from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import AAdminSensorsTutorial from "@/views/app@admin/app@sensors/a-admin-sensors-tutorial.vue";
import FileUpload from 'primevue/fileupload';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/utils/themeUtil';

const { t } = useI18n();
const isDarkMode = useTheme();

const groups = ref<SensorGroup[]>([]);
const colorClasses = ref<Enum>(null)

const isLoading = ref(true);
const expandedGroups = ref<Set<string>>(new Set());
const src = ref(null);
const src_img = ref(null);

const tutorialDialog = ref(false);
const groupDialog = ref(false);
const sensorDialog = ref(false);
const deleteGroupDialog = ref(false);
const deleteSensorDialog = ref(false);

const selectedGroup = ref<SensorGroup | null>(null);
const selectedSensor = ref<Sensor | null>(null);

const groupNameError = ref('');
const groupValueError = ref('');
const groupImageError = ref('');

const sensorNameError = ref('');
const sensorTypeError = ref('');
const sensorDisplayNameError = ref('');
const sensorUnitError = ref('');
const sensorCssClassError = ref('');
const sensorImageError = ref('');
const sensorIconError = ref('');

const groupForm = ref({
  id: null,
  group_name: '',
  group_value: '',
  image_path: '',
  image: null as File | null,
});

const sensorForm = ref({
  id: null,
  sensor_name: '',
  type: '',
  display_name: '',
  unit_of_measurement: '',
  is_output_binary: false,
  icon_path: '',
  image_path: '',
  color_class: '',
  group_id: null,
  icon: null as File | null,
  image: null as File | null,
});

const loadColorClasses = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get('/sensors/meta-data');
    colorClasses.value = response.color_classes;
  } catch (error) {
    showError(t('admin.sensors.failedToLoadColorClasses'));
  } finally {
    isLoading.value = false;
  }
};

const loadGroups = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get('/sensor-groups');
    groups.value = response;
  } catch (error) {
    showError(t('admin.sensors.failedToLoadGroups'));
  } finally {
    isLoading.value = false;
  }
};

const toggleGroup = (groupValue: string) => {
  if (expandedGroups.value.has(groupValue)) {
    expandedGroups.value.delete(groupValue);
  } else {
    expandedGroups.value.add(groupValue);
  }
};

const openGroupDialog = (group: SensorGroup | null = null) => {
  src.value = null;
  selectedGroup.value = group;

  if (group) {
    groupForm.value = {
      id: group.id,
      group_name: group.group_name,
      group_value: group.group_value,
      image_path: group.image_path,
      image: null,
    };
  } else {
    groupForm.value = {
      id: null,
      group_name: '',
      group_value: '',
      image_path: '',
      image: null
    };
  }

  groupNameError.value = '';
  groupValueError.value = '';
  groupImageError.value = '';
  groupDialog.value = true;
};

const openTutorialDialog = () => {
  tutorialDialog.value = true;
};

const openSensorDialog = (sensor: Sensor | null = null, groupId: any = null) => {
  src.value = null;
  src_img.value = null;
  selectedSensor.value = sensor;

  if (sensor) {
    sensorForm.value = {
      id: sensor.id,
      sensor_name: sensor.sensor_name,
      type: sensor.type,
      display_name: sensor.display_name,
      unit_of_measurement: sensor.unit_of_measurement,
      is_output_binary: sensor.is_output_binary,
      icon_path: sensor.icon_path || '',
      image_path: sensor.image_path || '',
      color_class: sensor.color_class.value || '',
      group_id: groupId,
      icon: null,
      image: null,
    };
  } else {
    sensorForm.value = {
      id: null,
      sensor_name: '',
      type: '',
      display_name: '',
      unit_of_measurement: '',
      is_output_binary: false,
      icon_path: '',
      image_path: '',
      color_class: '',
      group_id: groupId,
      icon: null,
      image: null,
    };
  }

  sensorNameError.value = '';
  sensorTypeError.value = '';
  sensorDisplayNameError.value = '';
  sensorUnitError.value = '';
  sensorCssClassError.value = '';
  sensorImageError.value = '';
  sensorIconError.value = '';
  sensorDialog.value = true;
};

const handleGroupImageUpload = (event) => {
  if (event.files) {
    groupForm.value.image = event.files[0];
    groupImageError.value = ''
    const reader = new FileReader();
    reader.onload = (e) => src.value = e.target?.result;
    reader.readAsDataURL(event.files[0]);
  }
};

const handleSensorImageUpload = (event) => {
  if (event.files) {
    sensorForm.value.image = event.files[0];
    sensorImageError.value = ''
    const reader = new FileReader();
    reader.onload = (e) => src_img.value = e.target?.result;
    reader.readAsDataURL(event.files[0]);
  }
};

const handleSensorIconUpload = (event) => {
  if (event.files) {
    sensorForm.value.icon = event.files[0];
    sensorIconError.value = ''
    const reader = new FileReader();
    reader.onload = (e) => src.value = e.target?.result;
    reader.readAsDataURL(event.files[0]);
  }
};

const saveGroup = async () => {
  try {
    if (!validateGroupName() || !validateGroupValue() || !validateGroupImage()) {
      return
    }

    const formData = new FormData();
    formData.append('group_name', groupForm.value.group_name);
    formData.append('group_value', groupForm.value.group_value);

    if (selectedGroup.value && !groupForm.value.image) {
      formData.append('keep_existing_image', 'true');
    } else if (groupForm.value.image) {
      formData.append('image', groupForm.value.image);
    } else if (!selectedGroup.value) {
      showError(t('admin.sensors.groupImageRequired'));
      return;
    }

    let response;
    if (selectedGroup.value) {
      response = await axiosInstance.post(`/sensor-groups/${selectedGroup.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await axiosInstance.post('/sensor-groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    if (response.type === 'success') {
      showSuccess(response.message);
      src.value = null;
      groupDialog.value = false;
      await loadGroups();
    } else {
      showError(response.message);
    }
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      if (errors.group_name) groupNameError.value = errors.group_name[0]
      if (errors.group_value) groupValueError.value = errors.group_value[0]
      if (errors.image) groupImageError.value = errors.image[0]
    } else {
      showError(t('admin.sensors.failedToSaveGroup'))
    }
  } finally {
    isLoading.value = false
  }
};

const saveSensor = async () => {
  try {
    if (
      !validateSensorName() ||
      !validateSensorType() ||
      !validateSensorDisplayName() ||
      !validateSensorCssClass() ||
      !validateSensorImage() ||
      !validateSensorIcon()
    ) {
      return
    }

    const formData = new FormData();
    formData.append('sensor_name', sensorForm.value.sensor_name);
    formData.append('type', sensorForm.value.type);
    formData.append('display_name', sensorForm.value.display_name);
    formData.append('color_class', sensorForm.value.color_class);
    formData.append('unit_of_measurement', sensorForm.value.unit_of_measurement || '');
    formData.append('is_output_binary', sensorForm.value.is_output_binary ? '1' : '0');
    formData.append('sensor_group_id', String(sensorForm.value.group_id));

    if (selectedSensor.value) {
      if (!sensorForm.value.image) formData.append('keep_existing_image', 'true');
      if (!sensorForm.value.icon) formData.append('keep_existing_icon', 'true');
    }

    if (sensorForm.value.image) {
      formData.append('image', sensorForm.value.image);
    } else if (!selectedSensor.value) {
      showError(t('admin.sensors.sensorImageRequired'));
      return;
    }

    if (sensorForm.value.icon) {
      formData.append('icon', sensorForm.value.icon);
    } else if (!selectedSensor.value) {
      showError(t('admin.sensors.sensorIconRequired'));
      return;
    }

    let response;
    if (selectedSensor.value) {
      response = await axiosInstance.post(`/sensors/${selectedSensor.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await axiosInstance.post('/sensors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    if (response.type === 'success') {
      showSuccess(response.message);
      src.value = null;
      src_img.value = null;
      sensorDialog.value = false;
      await loadGroups();
    } else {
      showError(response.message);
    }
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      if (errors.sensor_name) sensorNameError.value = errors.sensor_name[0]
      if (errors.type) sensorTypeError.value = errors.type[0]
      if (errors.display_name) sensorDisplayNameError.value = errors.display_name[0]
      if (errors.unit_of_measurement) sensorUnitError.value = errors.unit_of_measurement[0]
      if (errors.color_class) sensorCssClassError.value = errors.color_class[0]
      if (errors.image) sensorImageError.value = errors.image[0]
      if (errors.icon) sensorIconError.value = errors.icon[0]
    } else {
      showError(t('admin.sensors.failedToSaveSensor'))
    }
  } finally {
    isLoading.value = false
  }
};

const confirmDeleteGroup = (group: SensorGroup) => {
  selectedGroup.value = group;
  deleteGroupDialog.value = true;
};

const confirmDeleteSensor = (sensor: Sensor) => {
  selectedSensor.value = sensor;
  deleteSensorDialog.value = true;
};

const deleteGroup = async () => {
  try {
    if (selectedGroup.value) {
      const response = await axiosInstance.delete(`/sensor-groups/${selectedGroup.value.id}`);
      if (response.type === 'success') {
        showSuccess(response.message);
      } else {
        showError(response.message);
      }
      deleteGroupDialog.value = false;
      await loadGroups();
    }
  } catch (error) {
    showError(t('admin.sensors.failedToDeleteGroup'));
  }
};

const deleteSensor = async () => {
  try {
    if (selectedSensor.value) {
      const response = await axiosInstance.delete(`/sensors/${selectedSensor.value.id}`);
      if (response.type === 'success') {
        showSuccess(response.message);
      } else {
        showError(response.message);
      }
      deleteSensorDialog.value = false;
      await loadGroups();
    }
  } catch (error) {
    showError(t('admin.sensors.failedToDeleteSensor'));
  }
};

function validateGroupName() {
  if (!groupForm.value.group_name) {
    groupNameError.value = t('admin.sensors.groupNameValueRequired')
    return false
  }
  groupNameError.value = ''
  return true
}
function validateGroupValue() {
  if (!groupForm.value.group_value) {
    groupValueError.value = t('admin.sensors.groupNameValueRequired')
    return false
  }
  groupValueError.value = ''
  return true
}

function validateSensorName() {
  if (!sensorForm.value.sensor_name) {
    sensorNameError.value = t('admin.sensors.sensorNameRequired')
    return false
  }
  sensorNameError.value = ''
  return true
}
function validateSensorType() {
  if (!sensorForm.value.type) {
    sensorTypeError.value = t('admin.sensors.sensorTypeRequired')
    return false
  }
  sensorTypeError.value = ''
  return true
}
function validateSensorDisplayName() {
  if (!sensorForm.value.display_name) {
    sensorDisplayNameError.value = t('admin.sensors.sensorDisplayNameRequired')
    return false
  }
  sensorDisplayNameError.value = ''
  return true
}

function validateSensorCssClass() {
  if (!sensorForm.value.color_class) {
    sensorCssClassError.value = t('admin.sensors.cssClassRequired')
    return false
  }
  sensorCssClassError.value = ''
  return true
}

function validateGroupImage() {
  if (!groupForm.value.image && !groupForm.value.image_path) {
    groupImageError.value = t('admin.sensors.groupImageRequired')
    return false
  }
  groupImageError.value = ''
  return true
}

function validateSensorImage() {
  if (!sensorForm.value.image && !sensorForm.value.image_path) {
    sensorImageError.value = t('admin.sensors.sensorImageRequired')
    return false
  }
  sensorImageError.value = ''
  return true
}

function validateSensorIcon() {
  if (!sensorForm.value.icon && !sensorForm.value.icon_path) {
    sensorIconError.value = t('admin.sensors.sensorIconRequired')
    return false
  }
  sensorIconError.value = ''
  return true
}

onMounted(() => {
  loadGroups();
  loadColorClasses();
});
</script>

<template>
  <div class="lg:p-6 p-2">
    <ABreadcrumb class="lg:pl-4 lg:pt-4" />
    <div class="p-6">
      <div class="mb-4 flex flex-col lg:flex-row justify-between items-center space-y-2 lg:space-y-0">
        <h1 :class="['text-2xl font-bold', isDarkMode ? 'text-white' : 'text-black']">{{ t('admin.sensors.title') }}</h1>
        <Button
            :label="t('admin.sensors.tutorial')"
            icon="pi pi-question-circle"
            severity="info"
            @click="openTutorialDialog()"
            class="mr-2"
        />
        <AAdminKeyButton />
        <Button
            :label="t('admin.sensors.addGroup')"
            icon="pi pi-plus"
            severity="success"
            @click="openGroupDialog()"
            class="mr-2"
        />
      </div>

      <div v-if="isLoading">
        <ALoadingScreen :isLoading="isLoading" />
      </div>

      <div v-else class="space-y-6">
        <div v-if="groups.length === 0" class="bg-gray-800/50 p-6 rounded-lg text-center">
          <i class="pi pi-exclamation-circle text-4xl mb-4 text-yellow-400"></i>
          <p class="text-xl font-medium text-gray-300">{{ t('admin.sensors.noGroups') }}</p>
          <p class="text-gray-400 mt-2">{{ t('admin.sensors.createGroupHint') }}</p>
        </div>

        <div v-for="group in groups" :key="group.group_value" class="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
          <div class="p-4 flex justify-between items-center bg-gray-800 cursor-pointer" @click="toggleGroup(group.group_value)">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-lg bg-purple-600/30 mr-3 flex items-center justify-center">
                <i class="pi pi-folder text-purple-400"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">{{ group.group_name }}</h2>
                <p class="text-sm text-gray-400">{{ group.sensors?.length || 0 }} {{ t('admin.sensors.sensors') }}</p>
              </div>
            </div>

            <div class="flex items-center">
              <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="help"
                  class="mr-2"
                  @click.stop="openGroupDialog(group)"
                  :aria-label="t('admin.sensors.editGroup')"
              />
              <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  class="mr-2"
                  @click.stop="confirmDeleteGroup(group)"
                  :aria-label="t('admin.sensors.deleteGroup')"
              />
              <Button
                  icon="pi pi-plus"
                  text
                  rounded
                  class="mr-2"
                  @click.stop="openSensorDialog(null, group.id)"
                  :aria-label="t('admin.sensors.addSensor')"
              />
              <i :class="['pi', expandedGroups.has(group.group_value) ? 'pi-chevron-down' : 'pi-chevron-right', 'text-gray-400']"></i>
            </div>
          </div>

          <div v-if="expandedGroups.has(group.group_value)" class="p-4 bg-gray-900/50">
            <div v-if="!group.sensors || group.sensors.length === 0" class="text-center py-4 text-gray-400">
              {{ t('admin.sensors.noSensorsInGroup') }}
            </div>

            <div v-else :class="['overflow-x-auto rounded-lg border', isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : ' border-gray-200/80']">
              <DataTable :value="group.sensors" responsiveLayout="scroll" :class="isDarkMode ? 'dark-table' : 'light-table'">
                <Column
                    field="type"
                    :header="t('admin.sensors.type')"
                    :headerStyle="{ width: '28%' }"
                >
                  <template #body="{ data }">
                    <div class="flex">
                      <img v-if="data.icon_path" :src="data.icon_path" :alt="data.sensor_name" class="w-6 h-6 mr-2" />
                      <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ data.type }}</span>
                    </div>
                  </template>
                </Column>

                <Column
                    field="sensor_name"
                    :header="t('admin.sensors.name')"
                    :headerStyle="{ width: '28%' }"
                >
                  <template #body="{ data }">
                    <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.sensor_name }}</span>
                  </template>
                </Column>

                <Column
                    field="display_name"
                    :header="t('admin.sensors.displayName')"
                    :headerStyle="{ width: '28%' }"
                >
                  <template #body="{ data }">
                    <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">{{ data.display_name }}</span>
                  </template>
                </Column>

                <Column
                    :headerStyle="{ width: '16%' }"
                >
                  <template #header>
                    <div style="width: 100%; text-align: center; font-weight: 600;">{{ t('admin.sensors.actions') }}</div>
                  </template>
                  <template #body="{ data }">
                    <div class="flex gap-2 justify-center">
                      <Button
                          icon="pi pi-pencil"
                          text
                          rounded
                          severity="help"
                          @click="openSensorDialog(data, group.id)"
                          :aria-label="t('admin.sensors.editSensor')"
                      />
                      <Button
                          icon="pi pi-trash"
                          text
                          rounded
                          severity="danger"
                          @click="confirmDeleteSensor(data)"
                          :aria-label="t('admin.sensors.deleteSensor')"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        v-model:visible="groupDialog"
        :style="{ width: '500px' }"
        :header="selectedGroup ? t('admin.sensors.editGroup') : t('admin.sensors.newGroup')"
        :modal="true"
        class="p-fluid"
      >
        <div class="p-4 space-y-4">
          <div class="field">
            <label for="groupName" class="block mb-2 text-gray-300">{{ t('admin.sensors.groupName') }}</label>
            <InputText id="groupName" v-model="groupForm.group_name" required class="w-full" :invalid="!!groupNameError"/>
            <Message
              v-if="groupNameError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ groupNameError }}
            </Message>
          </div>

          <div class="field">
            <label for="groupValue" class="block mb-2 text-gray-300">{{ t('admin.sensors.groupValue') }}</label>
            <InputText id="groupValue" v-model="groupForm.group_value" required class="w-full" :invalid="!!groupValueError"
                      :placeholder="t('admin.sensors.groupValuePlaceholder')" />
            <Message
              v-if="groupValueError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ groupValueError }}
            </Message>
            <small v-if="!selectedGroup" class="text-gray-400">{{ t('admin.sensors.createFirstGroup') }}</small>
          </div>

          <div class="field">
            <label class="block mb-2 text-gray-300">{{ t('admin.sensors.groupImage') }}</label>

            <div v-if="selectedGroup && groupForm.image_path" class="mb-3">
              <p class="text-sm text-gray-400 mb-2">{{ t('admin.sensors.currentImage') }}</p>
              <img :src="groupForm.image_path" alt="Current Group Image" class="max-h-40 rounded-md" />
            </div>

            <FileUpload
                mode="basic"
                :accept="'image/*'"
                :maxFileSize="2000000"
                :auto="true"
                :chooseLabel="t('admin.sensors.browse')"
                class="w-full"
                @select="handleGroupImageUpload"
                :invalid="!!groupImageError"
            />
            <Message
              v-if="groupImageError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ groupImageError }}
            </Message>
            <small class="text-gray-400">{{ t('admin.sensors.maxSizeInfo') }}</small>
            <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
          </div>
        </div>

        <template #footer>
          <Button :label="t('admin.sensors.cancel')" icon="pi pi-times" text @click="groupDialog = false" severity="danger" />
          <Button :label="t('admin.sensors.save')" icon="pi pi-check" @click="saveGroup" severity="success" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="sensorDialog"
        :style="{ width: '600px' }"
        :header="selectedSensor ? t('admin.sensors.editSensor') : t('admin.sensors.newSensor')"
        :modal="true"
        class="p-fluid"
      >
        <div class="p-4 space-y-4">
          <div class="field">
            <label for="sensorName" class="block mb-2 text-gray-300">{{ t('admin.sensors.sensorName') }}</label>
            <InputText id="sensorName" v-model="sensorForm.sensor_name" required autofocus class="w-full" :invalid="!!sensorNameError" />
            <Message
              v-if="sensorNameError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ sensorNameError }}
            </Message>
          </div>

          <div class="field">
            <label for="sensorType" class="block mb-2 text-gray-300">{{ t('admin.sensors.sensorType') }}</label>
            <InputText id="sensorType" v-model="sensorForm.type" required class="w-full" :invalid="!!sensorTypeError"
                      :placeholder="t('admin.sensors.sensorTypePlaceholder')" />
            <Message
              v-if="sensorTypeError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ sensorTypeError }}
            </Message>
            <small v-if="!selectedSensor" class="text-gray-400">{{ t('admin.sensors.sensorTypeHelper') }}</small>
          </div>

          <div class="field">
            <label for="displayName" class="block mb-2 text-gray-300">{{ t('admin.sensors.displayName') }}</label>
            <InputText id="displayName" v-model="sensorForm.display_name" required class="w-full" :invalid="!!sensorDisplayNameError" />
            <Message
              v-if="sensorDisplayNameError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ sensorDisplayNameError }}
            </Message>
          </div>

          <div class="field">
            <label for="unitOfMeasurement" class="block mb-2 text-gray-300">{{ t('admin.sensors.unitOfMeasurement') }}</label>
            <InputText id="unitOfMeasurement" v-model="sensorForm.unit_of_measurement" required class="w-full" :invalid="!!sensorUnitError"
                      :placeholder="t('admin.sensors.unitOfMeasurementPlaceholder')" />
            <Message
              v-if="sensorUnitError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ sensorUnitError }}
            </Message>
          </div>

          <div class="field">
            <label for="isOutputBinary" class="block mb-2 text-gray-300">{{ t('admin.sensors.isOutputBinary') }}</label>
            <ToggleSwitch v-model="sensorForm.is_output_binary">
              <template #handle="{ checked }">
                <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]" />
              </template>
            </ToggleSwitch>
          </div>

          <div class="field">
            <Select
              v-model="sensorForm.color_class"
              :options="colorClasses"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('admin.sensors.selectColorClass')"
              checkmark
              :highlightOnSelect="false"
              class="w-full"
              :invalid="!!sensorCssClassError"
            />
            <Message
              v-if="sensorCssClassError"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ sensorCssClassError }}
            </Message>
            <small class="text-gray-400">{{ t('admin.sensors.cssClassInfo') }}</small>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
              <label class="block mb-2 text-gray-300">{{ t('admin.sensors.sensorIcon') }}</label>

              <div v-if="selectedSensor && sensorForm.icon_path" class="mb-3">
                <p class="text-sm text-gray-400 mb-2">{{ t('admin.sensors.currentIcon') }}</p>
                <img :src="sensorForm.icon_path" alt="Current Sensor Icon" class="max-h-20 rounded-md" />
              </div>

              <FileUpload
                mode="basic"
                :accept="'image/*'"
                :maxFileSize="2000000"
                :auto="true"
                :chooseLabel="t('admin.sensors.browse')"
                class="w-full"
                @select="handleSensorIconUpload"
                :invalid="!!sensorIconError"
              />
              <Message
                v-if="sensorIconError"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ sensorIconError }}
              </Message>
              <small class="text-gray-400">{{ t('admin.sensors.maxSizeInfo') }}</small>
              <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
            </div>

            <div class="field">
              <label class="block mb-2 text-gray-300">{{ t('admin.sensors.sensorImage') }}</label>

              <div v-if="selectedSensor && sensorForm.image_path" class="mb-3">
                <p class="text-sm text-gray-400 mb-2">{{ t('admin.sensors.currentSensorImage') }}</p>
                <img :src="sensorForm.image_path" alt="Current Sensor Image" class="max-h-20 rounded-md" />
              </div>

              <FileUpload
                mode="basic"
                :accept="'image/*'"
                :maxFileSize="2000000"
                :auto="true"
                :chooseLabel="t('admin.sensors.browse')"
                class="w-full"
                @select="handleSensorImageUpload"
                :invalid="!!sensorImageError"
              />
              <Message
                v-if="sensorImageError"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ sensorImageError }}
              </Message>
              <small class="text-gray-400">{{ t('admin.sensors.maxSizeInfo') }}</small>
              <img v-if="src_img" :src="src_img" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
            </div>
          </div>
        </div>

        <template #footer>
          <Button :label="t('admin.sensors.cancel')" icon="pi pi-times" text @click="sensorDialog = false" severity="danger" />
          <Button :label="t('admin.sensors.save')" icon="pi pi-check" @click="saveSensor" severity="success" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteGroupDialog"
        :style="{ width: '450px' }"
        :header="t('admin.sensors.confirmGroupDeletionTitle')"
        :modal="true"
      >
        <div class="flex align-items-center justify-content-center">
          <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mr-4"></i>
          <div>
            <p class="font-semibold text-lg">{{ t('admin.sensors.deleteGroup') }}</p>
            <p class="text-gray-300 mt-2">
              {{ t('admin.sensors.confirmGroupDeletion', { groupName: selectedGroup?.group_name }) }}
            </p>
          </div>
        </div>

        <template #footer>
          <Button :label="t('admin.sensors.no')" icon="pi pi-times" text @click="deleteGroupDialog = false" />
          <Button :label="t('admin.sensors.yesDelete')" icon="pi pi-trash" severity="danger" @click="deleteGroup" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteSensorDialog"
        :style="{ width: '450px' }"
        :header="t('admin.sensors.confirmGroupDeletionTitle')"
        :modal="true"
      >
        <div class="flex align-items-center justify-content-center">
          <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mr-4"></i>
          <div>
            <p class="font-semibold text-lg">{{ t('admin.sensors.deleteSensor') }}</p>
            <p class="text-gray-300 mt-2">
              {{ t('admin.sensors.confirmSensorDeletion', { sensorName: selectedSensor?.sensor_name }) }}
            </p>
          </div>
        </div>

        <template #footer>
          <Button :label="t('admin.sensors.no')" icon="pi pi-times" text @click="deleteSensorDialog = false" />
          <Button :label="t('admin.sensors.yesDelete')" icon="pi pi-trash" severity="danger" @click="deleteSensor" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="tutorialDialog"
        :header="t('admin.sensors.tutorial')"
        :modal="true"
        :style="{ width: '80vw', maxWidth: '95vw' }"
      >
        <AAdminSensorsTutorial />
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
.dark-table :deep(.p-datatable-tbody > tr) {
  background-color: rgba(31, 41, 55, 0.3);
}

.dark-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: rgba(31, 41, 55, 0.5);
}

.light-table :deep(.p-datatable-tbody > tr) {
  background-color: rgba(255, 255, 255, 0.8);
}

.light-table :deep(.p-paginator) {
  background-color: rgba(243, 244, 246, 0.8);
  border-top: 1px solid rgba(209, 213, 219, 0.5);
}
</style>
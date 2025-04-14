<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import axiosInstance from "@/plugins/axios";
import { showSuccess, showError } from "@/utils/notificationUtil";
import {SensorGroup, Sensor, Enum} from '@/types';
import ALoadingScreen from "@/components/a-loading-screen.vue";
import FileUpload from 'primevue/fileupload';
import {RouterLink} from "vue-router";

const groups = ref<SensorGroup[]>([]);
const colorClasses = ref<Enum>(null)

const isLoading = ref(true);
const expandedGroups = ref<Set<string>>(new Set());
const src = ref(null);
const src_img = ref(null);

const groupDialog = ref(false);
const sensorDialog = ref(false);
const deleteGroupDialog = ref(false);
const deleteSensorDialog = ref(false);

const selectedGroup = ref<SensorGroup | null>(null);
const selectedSensor = ref<Sensor | null>(null);

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
    showError('Failed to load color classes');
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
    showError('Failed to load sensor groups');
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

  groupDialog.value = true;
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

  sensorDialog.value = true;
};

const handleGroupImageUpload = (event) => {
  if (event.files) {
    groupForm.value.image = event.files[0];
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      src.value = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

const handleSensorImageUpload = (event) => {
  if (event.files && event.files.length > 0) {
    sensorForm.value.image = event.files[0];
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      src_img.value = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

const handleSensorIconUpload = (event) => {
  if (event.files && event.files.length > 0) {
    sensorForm.value.icon = event.files[0];
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      src.value = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

const saveGroup = async () => {
  try {
    if (!groupForm.value.group_name || !groupForm.value.group_value) {
      showError('Group name and value are required');
      return;
    }

    const formData = new FormData();
    formData.append('group_name', groupForm.value.group_name);
    formData.append('group_value', groupForm.value.group_value);

    if (selectedGroup.value && !groupForm.value.image) {
      formData.append('keep_existing_image', 'true');
    } else if (groupForm.value.image) {
      formData.append('image', groupForm.value.image);
    } else if (!selectedGroup.value) {
      showError('Image is required');
      return;
    }

    let response;
    if (selectedGroup.value) {
      response = await axiosInstance.post(`/sensor-groups/${selectedGroup.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await axiosInstance.post('/sensor-groups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    if (response.type === 'success') {
      showSuccess(response.message);
    } else {
      showError(response.message);
    }
    src.value = null;
    groupDialog.value = false;
    await loadGroups();
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');
    } else {
      showError('Failed to save sensor group');
    }
  } finally {

  }
};

const saveSensor = async () => {
  try {
    if (!sensorForm.value.sensor_name || !sensorForm.value.type || !sensorForm.value.display_name) {
      showError('Sensor name, type and display name are required');
      return;
    }

    const formData = new FormData();
    formData.append('sensor_name', sensorForm.value.sensor_name);
    formData.append('type', sensorForm.value.type);
    formData.append('display_name', sensorForm.value.display_name);
    formData.append('color_class', sensorForm.value.color_class);
    formData.append('unit_of_measurement', sensorForm.value.unit_of_measurement || '');
    formData.append('is_output_binary', sensorForm.value.is_output_binary ? 1 : 0);
    formData.append('sensor_group_id', sensorForm.value.group_id);

    if (selectedSensor.value) {
      if (!sensorForm.value.image) {
        formData.append('keep_existing_image', 'true');
      }
      if (!sensorForm.value.icon) {
        formData.append('keep_existing_icon', 'true');
      }
    }

    if (sensorForm.value.image) {
      formData.append('image', sensorForm.value.image);
    } else if (!selectedSensor.value) {
      showError('Image is required');
      return;
    }

    if (sensorForm.value.icon) {
      formData.append('icon', sensorForm.value.icon);
    } else if (!selectedSensor.value) {
      showError('Icon is required');
      return;
    }

    let response;
    if (selectedSensor.value) {
      response = await axiosInstance.post(`/sensors/${selectedSensor.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await axiosInstance.post('/sensors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');
    } else {
      showError('Failed to save sensor');
    }
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
    showError('Failed to delete sensor group');
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
    showError('Failed to delete sensor');
  }
};

onMounted(() => {
  loadGroups();
  loadColorClasses();
});
</script>

<template>
  <div class="lg:p-6 p-2">
    <ABreadcrumb />

    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-white">Sensor Management</h1>
      <Button
          label="Add Sensor Group"
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
        <p class="text-xl font-medium text-gray-300">No sensor groups found</p>
        <p class="text-gray-400 mt-2">Click the 'Add Sensor Group' button to create your first group</p>
      </div>

      <div v-for="group in groups" :key="group.group_value" class="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
        <div class="p-4 flex justify-between items-center bg-gray-800 cursor-pointer" @click="toggleGroup(group.group_value)">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg bg-purple-600/30 mr-3 flex items-center justify-center">
              <i class="pi pi-folder text-purple-400"></i>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">{{ group.group_name }}</h2>
              <p class="text-sm text-gray-400">{{ group.sensors?.length || 0 }} sensors</p>
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
                aria-label="Edit group"
            />
            <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                class="mr-2"
                @click.stop="confirmDeleteGroup(group)"
                aria-label="Delete group"
            />
            <Button
                icon="pi pi-plus"
                text
                rounded
                class="mr-2"
                @click.stop="openSensorDialog(null, group.id)"
                aria-label="Add sensor"
            />
            <i :class="['pi', expandedGroups.has(group.group_value) ? 'pi-chevron-down' : 'pi-chevron-right', 'text-gray-400']"></i>
          </div>
        </div>

        <div v-if="expandedGroups.has(group.group_value)" class="p-4 bg-gray-900/50">
          <div v-if="!group.sensors || group.sensors.length === 0" class="text-center py-4 text-gray-400">
            No sensors in this group yet.
          </div>

          <DataTable v-else :value="group.sensors" stripedRows responsiveLayout="scroll">
            <Column
                field="type"
                header="Type"
                :headerStyle="{ width: '28%' }"
            >
              <template #body="{ data }">
                <div class="flex">
                  <img v-if="data.icon_path" :src="data.icon_path" :alt="data.sensor_name" class="w-6 h-6 mr-2" />
                  <span>{{ data.type }}</span>
                </div>
              </template>
            </Column>
            <Column
                field="sensor_name"
                header="Name"
                :headerStyle="{ width: '28%' }"
            >
            </Column>
            <Column
                field="display_name"
                header="Display name"
                :headerStyle="{ width: '28%' }"
            >
            </Column>
            <Column
                :headerStyle="{ width: '16%' }"
            >
              <template #header>
                <div style="width: 100%; text-align: center; font-weight: 600;">Actions</div>
              </template>
              <template #body="{ data }">
                <div class="flex gap-2 justify-center">
                  <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      severity="help"
                      @click="openSensorDialog(data, group.id)"
                      aria-label="Edit sensor"
                  />
                  <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      @click="confirmDeleteSensor(data)"
                      aria-label="Delete sensor"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog
        v-model:visible="groupDialog"
        :style="{ width: '500px' }"
        :header="selectedGroup ? 'Edit Sensor Group' : 'Add Sensor Group'"
        :modal="true"
        class="p-fluid"
    >
      <div class="p-4 space-y-4">
        <div class="field">
          <label for="groupName" class="block mb-2 text-gray-300">Group Name</label>
          <InputText id="groupName" v-model="groupForm.group_name" required class="w-full" />
        </div>

        <div class="field">
          <label for="groupValue" class="block mb-2 text-gray-300">Group Value (Slug)</label>
          <InputText id="groupValue" v-model="groupForm.group_value" required class="w-full"
                     placeholder="e.g. environmental-sensors"
          />
          <small v-if="!selectedGroup" class="text-gray-400">Used in URLs, lowercase with hyphens</small>
        </div>

        <div class="field">
          <label class="block mb-2 text-gray-300">Group Image</label>

          <div v-if="selectedGroup && groupForm.image_path" class="mb-3">
            <p class="text-sm text-gray-400 mb-2">Current image:</p>
            <img :src="groupForm.image_path" alt="Current Group Image" class="max-h-40 rounded-md" />
          </div>

          <FileUpload
              mode="basic"
              :accept="'image/*'"
              :maxFileSize="2000000"
              :auto="true"
              chooseLabel="Browse"
              class="w-full"
              @select="handleGroupImageUpload"
          />
          <small class="text-gray-400">Max size: 2MB. Allowed types: jpeg, png, jpg, gif</small>
          <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="groupDialog = false" severity="danger" />
        <Button label="Save" icon="pi pi-check" @click="saveGroup" severity="success" />
      </template>
    </Dialog>

    <Dialog
        v-model:visible="sensorDialog"
        :style="{ width: '600px' }"
        :header="selectedSensor ? 'Edit Sensor' : 'Add Sensor'"
        :modal="true"
        class="p-fluid"
    >
      <div class="p-4 space-y-4">
        <div class="field">
          <label for="sensorName" class="block mb-2 text-gray-300">Sensor Name</label>
          <InputText id="sensorName" v-model="sensorForm.sensor_name" required autofocus class="w-full" />
        </div>

        <div class="field">
          <label for="sensorType" class="block mb-2 text-gray-300">Sensor Type</label>
          <InputText id="sensorType" v-model="sensorForm.type" required class="w-full"
                     placeholder="e.g. temperature"
          />
          <small v-if="!selectedSensor" class="text-gray-400">Unique identifier for this sensor for MQTT topic. You will after use {type}-data name for topic.</small>
        </div>

        <div class="field">
          <label for="displayName" class="block mb-2 text-gray-300">Display Name</label>
          <InputText id="displayName" v-model="sensorForm.display_name" required class="w-full" />
        </div>

        <div class="field">
          <label for="unitOfMeasurement" class="block mb-2 text-gray-300">Unit of Measurement</label>
          <InputText id="unitOfMeasurement" v-model="sensorForm.unit_of_measurement" required class="w-full" placeholder="e.g. °C, %, hPa" />
        </div>

        <div class="field">
          <label for="isOutputBinary" class="block mb-2 text-gray-300">Is output 0/1?</label>
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
              placeholder="Select a color class"
              checkmark
              :highlightOnSelect="false"
              class="w-full"
          >
          </Select>
          <small class="text-gray-400">CSS class for styling</small>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="field">
            <label class="block mb-2 text-gray-300">Sensor Icon</label>

            <div v-if="selectedSensor && sensorForm.icon_path" class="mb-3">
              <p class="text-sm text-gray-400 mb-2">Current icon:</p>
              <img :src="sensorForm.icon_path" alt="Current Sensor Icon" class="max-h-20 rounded-md" />
            </div>

            <FileUpload
                mode="basic"
                :accept="'image/*'"
                :maxFileSize="2000000"
                :auto="true"
                chooseLabel="Browse"
                class="w-full"
                @select="handleSensorIconUpload"
            />
            <small class="text-gray-400">Max size: 2MB.</small>
            <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
          </div>

          <div class="field">
            <label class="block mb-2 text-gray-300">Sensor Image</label>

            <div v-if="selectedSensor && sensorForm.image_path" class="mb-3">
              <p class="text-sm text-gray-400 mb-2">Current image:</p>
              <img :src="sensorForm.image_path" alt="Current Sensor Image" class="max-h-20 rounded-md" />
            </div>

            <FileUpload
                mode="basic"
                :accept="'image/*'"
                :maxFileSize="2000000"
                :auto="true"
                chooseLabel="Browse"
                class="w-full"
                @select="handleSensorImageUpload"
            />
            <small class="text-gray-400">Max size: 2MB.</small>
            <img v-if="src_img" :src="src_img" alt="Image" class="shadow-md rounded-xl w-full sm:w-64" style="filter: grayscale(100%)" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="sensorDialog = false" severity="danger" />
        <Button label="Save" icon="pi pi-check" @click="saveSensor" severity="success" />
      </template>
    </Dialog>

    <Dialog
        v-model:visible="deleteGroupDialog"
        :style="{ width: '450px' }"
        header="Confirm Deletion"
        :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mr-4"></i>
        <div>
          <p class="font-semibold text-lg">Delete Sensor Group</p>
          <p class="text-gray-300 mt-2">
            Are you sure you want to delete '{{ selectedGroup?.group_name }}'?
            This will also delete all sensors in this group.
          </p>
        </div>
      </div>

      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteGroupDialog = false" />
        <Button label="Yes, Delete" icon="pi pi-trash" severity="danger" @click="deleteGroup" />
      </template>
    </Dialog>

    <Dialog
        v-model:visible="deleteSensorDialog"
        :style="{ width: '450px' }"
        header="Confirm Deletion"
        :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mr-4"></i>
        <div>
          <p class="font-semibold text-lg">Delete Sensor</p>
          <p class="text-gray-300 mt-2">
            Are you sure you want to delete '{{ selectedSensor?.sensor_name }}'?
            This will also delete all data associated with this sensor.
          </p>
        </div>
      </div>

      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteSensorDialog = false" />
        <Button label="Yes, Delete" icon="pi pi-trash" severity="danger" @click="deleteSensor" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
</style>
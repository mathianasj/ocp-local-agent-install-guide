import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface Machine {
  hostname: string,
  interfaceName: string,
  macAddress: string,
  deviceHintName: string,
  ipAddress: string,
  dnsServer: string,
  defaultRoute: string,
}

interface IDownloadUrl {
  oc: string,
  ocFilename?: string,
  installer: string,
  installerFilename?: string
}

interface IOptions {
  [propName: string]: IDownloadUrl
}

export const useInputStore = defineStore('inputs', () => {
  const dnsZone = ref("example.com");
  const clusterName = ref("testcluster");
  const apiVip = ref("192.168.6.20");
  const ingressVip = ref("192.168.6.21");
  const pullSecret = ref("{}")
  const clusterType = ref("standard");
  const showVips = ref(true);
  const workerCount = ref(2);
  const publicKey = ref("");
  const machineType = ref("mac_64");
  const downloadUrls = ref<IDownloadUrl>({
    oc:"",
    ocFilename: "",
    installer: "",
    installerFilename: ""
  });
  const machineCidr = ref("192.168.6.0/24")
  const disconnected = ref(true);
  const mirrorHostName = ref("");
  const mirrorHostUsername = ref("");

  const regex : RegExp = /(?:.*:\/\/)(?:.*\/)(.*)/gm;

  const workers = ref<Machine[]>([
    {
      hostname: "worker-0",
      interfaceName: 'eno1',
      macAddress: '',
      deviceHintName: '/dev/vdb',
      ipAddress: '192.168.100.5',
      dnsServer: '192.168.100.1',
      defaultRoute: '192.168.100.1'
    },
    {
      hostname: "worker-1",
      interfaceName: 'eno1',
      macAddress: '',
      deviceHintName: '/dev/vdb',
      ipAddress: '192.168.100.6',
      dnsServer: '192.168.100.1',
      defaultRoute: '192.168.100.1'
    },
  ])
  
  const masters = ref<Machine[]>([
    {
      hostname: "master-0",
      interfaceName: 'eno1',
      macAddress: '',
      deviceHintName: '/dev/vdb',
      ipAddress: '192.168.100.2',
      dnsServer: '192.168.100.1',
      defaultRoute: '192.168.100.1'
    },
    {
      hostname: "master-1",
      interfaceName: 'eno1',
      macAddress: '',
      deviceHintName: '/dev/vdb',
      ipAddress: '192.168.100.3',
      dnsServer: '192.168.100.1',
      defaultRoute: '192.168.100.1'
    },
    {
      hostname: "master-2",
      interfaceName: 'eno1',
      macAddress: '',
      deviceHintName: '/dev/vdb',
      ipAddress: '192.168.100.4',
      dnsServer: '192.168.100.1',
      defaultRoute: '192.168.100.1'
    }
  ])

  watch(machineType, (newM, oldM) => {
    const staticUrls : IOptions = {
      mac_64: {
        oc: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-client-mac.tar.gz",
        installer: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-install-mac.tar.gz"
      },
      mac_arm: {
        oc: "https://mirror.openshift.com/pub/openshift-v4/aarch64/clients/ocp/stable/openshift-client-mac-arm64.tar.gz",
        installer: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-install-mac-arm64.tar.gz"
      },
      linux_64: {
        oc: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-client-linux.tar.gz",
        installer: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-install-linux.tar.gz"
      },
      rhel8_64: {
        oc: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-client-linux-amd64-rhel8.tar.gz",
        installer: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-install-linux.tar.gz"
      },
      rhel9_64: {
        oc: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-client-linux-amd64-rhel9.tar.gz",
        installer: "https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-install-linux.tar.gz"
      },
    }

    downloadUrls.value = staticUrls[newM];
    
    const [[, ocFilename]] = downloadUrls.value.oc.matchAll(regex);
    const [[, installerFilename]] = downloadUrls.value.installer.matchAll(regex);

    downloadUrls.value.ocFilename = ocFilename;
    downloadUrls.value.installerFilename = installerFilename;
  })
  
  watch(workerCount, (newCount, oldCount) => {
    const newWorkers = []

    let i = 0;
    while(i < newCount) {
      if(i >= oldCount) {
        newWorkers[i] = {
          hostname: "",
          interfaceName: '',
          macAddress: '',
          deviceHintName: '',
          ipAddress: '',
          dnsServer: '',
          defaultRoute: ''
        }
      } else {
        newWorkers[i] = workers.value[i];
      }
      i++;
    }

    console.log(newWorkers);

    workers.value = newWorkers;
  })

  watch(clusterType, (newType, oldType) => {
    showVips.value = newType == "standard" || newType == "compact";

    if(!showVips.value) {
      masters.value = [masters.value[0]]
      workers.value = []
      apiVip.value = masters.value[0].ipAddress
      ingressVip.value = masters.value[0].ipAddress
    } else {
      masters.value = [masters.value[0],masters.value[0],masters.value[0]]

      if(newType === "compact") {
        workers.value = []
      } else {
        workers.value = [
          {
              hostname: "",
              interfaceName: '',
              macAddress: '',
              deviceHintName: '',
              ipAddress: '',
              dnsServer: '',
              defaultRoute: ''
          },
          {
            hostname: "",
            interfaceName: '',
            macAddress: '',
            deviceHintName: '',
            ipAddress: '',
            dnsServer: '',
            defaultRoute: ''
          }
        ]
      }

      if(oldType === "sno") {
        apiVip.value = ""
        ingressVip.value = ""
      }
    }
  });

  return { 
    dnsZone,
    clusterName,
    apiVip,
    ingressVip,
    pullSecret,
    masters,
    clusterType,
    showVips,
    workers,
    workerCount,
    publicKey,
    machineType,
    downloadUrls,
    machineCidr,
    disconnected,
    mirrorHostName,
    mirrorHostUsername
  }
})

import Head from "next/head";
import { useEffect, useState } from "react";
import moment from "moment";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { FaPlus } from "react-icons/fa";

import { deleteBukuKerja } from "client/BukuKerjaGuruClient";
import ModalBuatKalenderPribadi from "components/Kalender/ModalBuatKalenderPribadi";
import {
  deleteKalenderLabel,
  getKalenderData,
  getKalenderPribadi,
} from "../../../../client/KalenderClient";
import CardBukuKerja from "components/BukuKerjaGuru/CardBukuKerja";
import LayoutBukuKerjaDetail from "components/BukuKerjaGuru/LayoutBukuKerjaDetail";
import Title from "components/BukuKerjaGuru/Title";
import useBukuKerjaDetail from "hooks/useBukuKerjaDetail";
import useEditModal from "hooks/useEditModal";
import SidebarTabMenu from "components/Shared/SidebarTabMenu/SidebarTabMenu";
import CalendarComponent from "components/Shared/CalendarComponent/CalendarComponent";
import ModalBuatKalenderPendidikan from "components/Kalender/ModalBuatKalenderPendidikan";
import ModalBuatKegiatan from "components/Kalender/ModalBuatKegiatan";
import ModalBuatLabelKalender from "components/Kalender/ModalBuatLabelKalender";
import ModalDetailPendidikan from "components/Kalender/ModalDetailPendidikan";
import ModalDetailKegiatan from "components/Kalender/ModalDetailKegiatan";
import ModalDetailPribadi from "components/Kalender/ModalDetailPribadi"; // Tambahkan import ini
import { ssURL } from "../../../../client/clientAxios";
import { momentPackage } from "../../../../utilities/HelperUtils";
import { getPreviewURL } from "utilities/FileViewer";
import { showModal } from "utilities/ModalUtils";

const months = {
  Januari: "01",
  Februari: "02",
  Maret: "03",
  April: "04",
  Mei: "05",
  Juni: "06",
  Juli: "07",
  Agustus: "08",
  September: "09",
  Oktober: "10",
  November: "11",
  Desember: "12",
};

const PageKalender = () => {
  const router = useRouter();
  const label = router.query.label;

  const { bukuKerjaDetailData, refetchBukuKerjaDetail, refetchData } = useBukuKerjaDetail();
  const { setEditModal } = useEditModal();
  const { data: datas } = bukuKerjaDetailData || {};

  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [editKalenderData, setEditKalenderData] = useState(null);
  const [listLabelKalender, setListLabelKalender] = useState([]);
  const [editData, setEditData] = useState(null);
  const [editDataPendidikan, setEditDataPendidikan] = useState(null);
  const [editDataPribadi, setEditDataPribadi] = useState(null);
  const [kalender, setKalender] = useState({});
  const { label: kalenderLabel } = kalender;
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(momentPackage().format("YYYY-MM"));
  const [eventClickedData, setEventClickedData] = useState(null);

  const listMenu =
    kalenderLabel?.length > 0
      ? kalenderLabel?.map((dt) => ({
        data: dt,
        url: `${ssURL}/kalender?label=${dt?.nama}`,
        nama: (
          <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: dt?.warna,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
            <span
              className="ms-2 text-truncate"
              style={{
                fontSize: 13,
                maxWidth: 90,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={dt?.nama}
            >
              {dt?.nama}
            </span>
          </div>
        ),
      }))
      : [];

  const _getKalenderData = async () => {
    let query = { tanggal: currentDate };
    const { data } = await getKalenderData(query);
    const labels = data?.label || [];
    setListLabelKalender(labels);

    const eventsDataKegiatan = data?.kegiatan?.map((dt) => ({
      title: dt?.nama,
      start: momentPackage(dt?.tanggalMulai).format("YYYY-MM-DD") ||
        momentPackage(dt?.tanggalAwal).format("YYYY-MM-DD"),
      end: momentPackage(dt?.tanggalAkhir).add(1, "days").format("YYYY-MM-DD"),
      id: dt?.id,
      isKegiatanEvent: true,
      isPendidikanEvent: false,
      color: dt?.label?.warna,
    })) || [];

    const eventsDataPendidikan = data?.pendidikan?.map((dt) => ({
      title: dt?.nama,
      start: momentPackage(dt?.tanggalMulai).format("YYYY-MM-DD") ||
        momentPackage(dt?.tanggalAwal).format("YYYY-MM-DD"),
      end: momentPackage(dt?.tanggalAkhir).add(1, "days").format("YYYY-MM-DD"),
      id: dt?.id,
      isKegiatanEvent: false,
      isPendidikanEvent: true,
      color: dt?.label?.warna,
    })) || [];

    const kalenderPribadiRes = await getKalenderPribadi();
    const kalenderPribadiList = kalenderPribadiRes?.data || [];
    const eventsDataPribadi = kalenderPribadiList.map((dt) => ({
      title: dt?.nama,
      // Ambil tanggal awal, fallback ke tanggal_awal, dan format Y-M-D
      start: momentPackage(dt?.tanggalMulai).format("YYYY-MM-DD") ||
        momentPackage(dt?.tanggalAwal).format("YYYY-MM-DD"),
      end: momentPackage(dt?.tanggalAkhir).add(1, "days").format("YYYY-MM-DD"),
      id: dt?.id,
      isPribadiEvent: true,
      color: (labels?.find(l => l.id === Number(dt.warna))?.warna) || "#bbb",
      deskripsi: dt?.deskripsi,
      allDay: true,
    }));




    setKalender(data);
    setCalendarEvents([
      ...eventsDataKegiatan,
      ...eventsDataPendidikan,
      ...eventsDataPribadi,
    ]);
  };

  const handleDeleteLabel = async (id) => {
    const { data } = await deleteKalenderLabel(id);
    if (data) {
      toast.success(data?.message);
      _getKalenderData();
      router.push(
        {
          pathname: `${ssURL}/kalender`,
          query: { label: listMenu[listMenu.length - 2].data.nama },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  // Ubah handler klik event agar bisa handle event pribadi juga
  const onClickCalendar = (e) => {
    setEventClickedData({ id: e.event._def.publicId });
    const ext = e.event._def.extendedProps;
    let modalId = "ModalDetailKegiatan";
    if (ext.isPendidikanEvent) modalId = "ModalDetailPendidikan";
    else if (ext.isPribadiEvent) modalId = "ModalDetailPribadi"; // untuk event pribadi
    if (typeof window !== "undefined" && window.bootstrap) {
      const modal = document.getElementById(modalId);
      if (modal && window.bootstrap.Modal) {
        new window.bootstrap.Modal(modal).show();
      }
    }
  };

  const handleDomCharacterDataModified = (event) => {
    const strDate = event?.newValue;
    const yearNumber = strDate.replace(/\D/g, "");
    const monthString = strDate.replace(/[^a-z]/gi, "");
    const monthNumber = months[monthString];
    if (!strDate.includes("–")) {
      setCurrentDate(`${yearNumber}-${monthNumber}`);
    }
  };

  useEffect(() => {
    const fcToolbarTitle = document.querySelector(".fc-toolbar-title");
    if (fcToolbarTitle) {
      fcToolbarTitle.addEventListener(
        "DOMCharacterDataModified",
        handleDomCharacterDataModified,
        false
      );
    }
    return () => {
      if (fcToolbarTitle) {
        fcToolbarTitle.removeEventListener(
          "keydown",
          handleDomCharacterDataModified,
          false
        );
      }
    };
  }, []);

  useEffect(() => {
    _getKalenderData();
    // eslint-disable-next-line
  }, [currentDate]);

  useEffect(() => {
    if (label) {
      const index = listMenu.findIndex((menu) => menu.url.includes(label));
      setActiveMenuIndex(index === -1 ? 0 : index);
    }
    // eslint-disable-next-line
  }, [label]);

  const _deleteBukuKerja = (id) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Perhatikan kembali data yang ingin anda hapus",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteBukuKerja(id);
        if (data) {
          toast.success(data?.message);
          refetchBukuKerjaDetail(!refetchData);
        } else {
          toast.error(error?.message);
        }
      }
    });
  };

  const onClickEdit = (editData) => {
    showModal("modalTambahKalenderPendidikan");
    setEditModal("modalTambahKalenderPendidikan", editData);
  };

  return (
    <>
      {/* Load Bootstrap CSS dari CDN */}
      <Head>

      </Head>

      <LayoutBukuKerjaDetail>
        <Title>Kalender Pendidikan</Title>
        <div className="row">
          <SidebarTabMenu
            listMenu={listMenu}
            activeMenuIndex={activeMenuIndex}
            withHeader={{
              text: "Label Kalender",
              dataBsTarget: "#ModalBuatLabelKalender",
              onClick: () => setEditKalenderData(null),
            }}
            withDropdown={{
              onClickEdit: (data) => setEditKalenderData(data),
              onClickDelete: (data) => handleDeleteLabel(data?.data?.id),
              dataBsTarget: "ModalBuatLabelKalender",
            }}
          />
          <div className="col-md-12 col-lg-9">
            {/* Tombol Buat */}
            <div className="px-3 py-2 bg-white shadow-dark-ss rounded-ss mb-4">
              <div style={{ display: "grid" }} className="dropdown dropdown-ss">
                <button
                  className="btn btn-primary bg-gradient-primary shadow-primary-ss fw-bold py-3 rounded-pill btn-ss"
                  aria-expanded="false"
                  style={{ justifySelf: "flex-end" }}
                  role="button"
                  id="dropdownBuatKalender"
                  data-bs-toggle="dropdown"
                >
                  <FaPlus className="me-2" />
                  Buat
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-ss my-1"
                  aria-labelledby="dropdownBuatKalender"
                >
                  <li>
                    <a
                      className="dropdown-item color-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#ModalBuatKalenderPendidikan"
                    >
                      Kalender Pendidikan
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item color-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#ModalBuatKegiatan"
                    >
                      Kegiatan
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item color-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#ModalBuatKalenderPribadi"
                    >
                      Kalender Pribadi
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Kalender */}
            <div className="px-3 py-4 bg-white shadow-dark-ss rounded-ss">
              <CalendarComponent
                events={calendarEvents}
                currentDate={currentDate}
                onClick={onClickCalendar}
              />
            </div>
          </div>
        </div>

        {/* Semua modal */}
        <ModalBuatKalenderPendidikan
          _getKalenderData={_getKalenderData}
          editData={editDataPendidikan}
        />
        <ModalBuatKegiatan
          _getKalenderData={_getKalenderData}
          editData={editData}
        />
        <ModalBuatLabelKalender
          _getKalenderData={_getKalenderData}
          editKalenderData={editKalenderData}
        />
        <ModalBuatKalenderPribadi
          _getKalenderData={_getKalenderData}
          editData={editDataPribadi}
          setEditData={setEditDataPribadi}
        />
        <ModalDetailPendidikan
          _getKalenderData={_getKalenderData}
          id={eventClickedData?.id}
          editDataPendidikan={editDataPendidikan}
          setEditDataPendidikan={setEditDataPendidikan}
        />
        <ModalDetailKegiatan
          _getKalenderData={_getKalenderData}
          id={eventClickedData?.id}
          editData={editData}
          setEditData={setEditData}
        />
        <ModalDetailPribadi
          id={eventClickedData?.id}
          _getKalenderData={_getKalenderData}
          editData={editDataPribadi}
          setEditDataPribadi={setEditDataPribadi}
          modalId="ModalDetailPribadi"
        />


        {/* Buku Kerja */}
        <div className="row mt-4 pt-4 g-4">
          {datas?.map((data) => (
            <CardBukuKerja
              key={data?.id}
              title={data?.judul}
              topLabel={[
                { text: `${data?.ta?.tahun} - ${data?.ta?.semester}` },
              ]}
              backgroundIcon="/img/icon-buku-kerja-2.png"
              withDropdown={{
                dropdownId: `dropdown-buku-kerja-${data?.id}`,
                onClickEdit: () => onClickEdit(data),
                onClickDelete: () => _deleteBukuKerja(data?.id),
              }}
              onClick={() =>
                data?.lampiran && window.open(getPreviewURL(data?.lampiran))
              }
            />
          ))}
        </div>
      </LayoutBukuKerjaDetail>
    </>
  );
};

export default dynamic(() => Promise.resolve(PageKalender), {
  ssr: false,
});

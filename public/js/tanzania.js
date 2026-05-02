// Tanzania regions and districts (comprehensive list)
export const TANZANIA = {
  "Arusha": ["Arusha City","Arusha DC","Karatu","Longido","Meru","Monduli","Ngorongoro"],
  "Dar es Salaam": ["Ilala","Kinondoni","Temeke","Kigamboni","Ubungo"],
  "Dodoma": ["Dodoma City","Bahi","Chamwino","Chemba","Kondoa","Kongwa","Mpwapwa"],
  "Geita": ["Geita Town","Geita DC","Bukombe","Chato","Mbogwe","Nyang'hwale"],
  "Iringa": ["Iringa MC","Iringa DC","Kilolo","Mafinga","Mufindi"],
  "Kagera": ["Bukoba MC","Bukoba DC","Biharamulo","Karagwe","Kyerwa","Missenyi","Muleba","Ngara"],
  "Katavi": ["Mpanda MC","Mpanda DC","Mlele","Nsimbo"],
  "Kigoma": ["Kigoma MC","Kigoma DC","Buhigwe","Kakonko","Kasulu","Kibondo","Uvinza"],
  "Kilimanjaro": ["Moshi MC","Moshi DC","Hai","Mwanga","Rombo","Same","Siha"],
  "Lindi": ["Lindi MC","Lindi DC","Kilwa","Liwale","Nachingwea","Ruangwa"],
  "Manyara": ["Babati TC","Babati DC","Hanang","Kiteto","Mbulu","Simanjiro"],
  "Mara": ["Musoma MC","Musoma DC","Bunda","Butiama","Rorya","Serengeti","Tarime"],
  "Mbeya": ["Mbeya City","Mbeya DC","Busokelo","Chunya","Kyela","Mbarali","Rungwe"],
  "Morogoro": ["Morogoro MC","Morogoro DC","Gairo","Ifakara","Kilombero","Kilosa","Mvomero","Ulanga"],
  "Mtwara": ["Mtwara MC","Mtwara DC","Masasi TC","Masasi DC","Nanyumbu","Newala","Tandahimba"],
  "Mwanza": ["Nyamagana","Ilemela","Kwimba","Magu","Misungwi","Sengerema","Ukerewe"],
  "Njombe": ["Njombe TC","Njombe DC","Ludewa","Makambako","Makete","Wanging'ombe"],
  "Pwani": ["Bagamoyo","Chalinze","Kibaha TC","Kibaha DC","Kisarawe","Mafia","Mkuranga","Rufiji"],
  "Rukwa": ["Sumbawanga MC","Sumbawanga DC","Kalambo","Nkasi"],
  "Ruvuma": ["Songea MC","Songea DC","Mbinga","Namtumbo","Nyasa","Tunduru"],
  "Shinyanga": ["Shinyanga MC","Shinyanga DC","Kahama TC","Kishapu","Msalala","Ushetu"],
  "Simiyu": ["Bariadi","Busega","Itilima","Maswa","Meatu"],
  "Singida": ["Singida MC","Singida DC","Ikungi","Iramba","Manyoni","Mkalama"],
  "Songwe": ["Mbozi","Ileje","Momba","Songwe","Tunduma"],
  "Tabora": ["Tabora MC","Tabora DC","Igunga","Kaliua","Nzega","Sikonge","Urambo","Uyui"],
  "Tanga": ["Tanga City","Handeni TC","Handeni DC","Kilindi","Korogwe TC","Korogwe DC","Lushoto","Mkinga","Muheza","Pangani"],
  "Kaskazini Pemba": ["Micheweni","Wete"],
  "Kusini Pemba": ["Chake Chake","Mkoani"],
  "Kaskazini Unguja": ["Kaskazini A","Kaskazini B"],
  "Kusini Unguja": ["Kati","Kusini"],
  "Mjini Magharibi": ["Mjini","Magharibi A","Magharibi B"]
};

export function fillRegions(selectEl){
  selectEl.innerHTML = '<option value="">Select region</option>' +
    Object.keys(TANZANIA).sort().map(r=>`<option value="${r}">${r}</option>`).join("");
}
export function fillDistricts(regionSelect, districtSelect){
  const region = regionSelect.value;
  districtSelect.innerHTML = region
    ? '<option value="">Select district</option>' + TANZANIA[region].map(d=>`<option value="${d}">${d}</option>`).join("")
    : '<option value="">Select region first</option>';
}

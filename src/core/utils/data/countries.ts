export interface Country {
  code: string; // ISO 3166-1 alpha-2 code
  name: string;
  phoneCode: string;
  flag: string;
  cities: string[];
}

export const COUNTRIES: Country[] = [
  {
    code: 'SO',
    name: 'Somaliland',
    phoneCode: '+252',
    flag: '',
    cities: ['Hargeisa', 'Berbera', 'Burao', 'Erigavo', 'Badhan', 'Las Anod']
  },
  {
    code: 'US',
    name: 'United States',
    phoneCode: '+1',
    flag: '🇺🇸',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington']
  },
  {
    code: 'CA',
    name: 'Canada',
    phoneCode: '+1',
    flag: '🇨🇦',
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Halifax', 'Victoria', 'Windsor', 'Oshawa', 'Saskatoon', 'Regina', 'Sherbrooke', 'Barrie', 'Kelowna']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    phoneCode: '+44',
    flag: '🇬🇧',
    cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Belfast', 'Nottingham', 'Newcastle', 'Brighton', 'Hull', 'Plymouth', 'Stoke-on-Trent', 'Wolverhampton', 'Derby']
  },
  {
    code: 'AU',
    name: 'Australia',
    phoneCode: '+61',
    flag: '🇦🇺',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury']
  },
  {
    code: 'DE',
    name: 'Germany',
    phoneCode: '+49',
    flag: '🇩🇪',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster']
  },
  {
    code: 'FR',
    name: 'France',
    phoneCode: '+33',
    flag: '🇫🇷',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne']
  },
  {
    code: 'IT',
    name: 'Italy',
    phoneCode: '+39',
    flag: '🇮🇹',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Taranto', 'Prato', 'Reggio Calabria', 'Modena']
  },
  {
    code: 'ES',
    name: 'Spain',
    phoneCode: '+34',
    flag: '🇪🇸',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet de Llobregat', 'A Coruña', 'Vitoria-Gasteiz', 'Granada', 'Elche']
  },
  {
    code: 'JP',
    name: 'Japan',
    phoneCode: '+81',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Sagamihara', 'Shizuoka']
  },
  {
    code: 'CN',
    name: 'China',
    phoneCode: '+86',
    flag: '🇨🇳',
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing', 'Foshan', 'Shenyang', 'Hangzhou', 'Xian', 'Harbin', 'Qingdao', 'Changchun', 'Dalian', 'Zhengzhou', 'Shantou', 'Jinan']
  },
  {
    code: 'IN',
    name: 'India',
    phoneCode: '+91',
    flag: '🇮🇳',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara']
  },
  {
    code: 'BR',
    name: 'Brazil',
    phoneCode: '+55',
    flag: '🇧🇷',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Nova Iguaçu', 'Teresina']
  },
  {
    code: 'MX',
    name: 'Mexico',
    phoneCode: '+52',
    flag: '🇲🇽',
    cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Guadalupe', 'Acapulco', 'Tlalnepantla', 'Cancún', 'Querétaro']
  },
  {
    code: 'RU',
    name: 'Russia',
    phoneCode: '+7',
    flag: '🇷🇺',
    cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Perm', 'Voronezh', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk']
  },
  {
    code: 'NL',
    name: 'Netherlands',
    phoneCode: '+31',
    flag: '🇳🇱',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Haarlemmermeer', 'Apeldoorn', 'Amersfoort', 'Dordrecht', 'Leiden', 'Zoetermeer']
  },
  {
    code: 'CH',
    name: 'Switzerland',
    phoneCode: '+41',
    flag: '🇨🇭',
    cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne', 'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Fribourg', 'Vernier', 'Chur', 'Neuchâtel', 'Uster', 'Sion']
  },
  {
    code: 'KR',
    name: 'South Korea',
    phoneCode: '+82',
    flag: '🇰🇷',
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Cheongju', 'Ansan', 'Jeonju', 'Anyang', 'Cheonan', 'Pohang', 'Uijeongbu']
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    phoneCode: '+64',
    flag: '🇳🇿',
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Napier', 'Porirua', 'Hibiscus Coast', 'New Plymouth', 'Rotorua', 'Whangarei', 'Nelson', 'Hastings', 'Invercargill', 'Upper Hutt', 'Gisborne', 'Takapuna', 'Lower Hutt']
  },
  {
    code: 'SG',
    name: 'Singapore',
    phoneCode: '+65',
    flag: '🇸🇬',
    cities: ['Singapore']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    phoneCode: '+27',
    flag: '🇿🇦',
    cities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Pietermaritzburg', 'Benoni', 'Tembisa', 'Germiston', 'Soweto', 'Randburg', 'Centurion', 'Roodepoort', 'Boksburg', 'Klerksdorp', 'Midrand', 'Mitchells Plain', 'Umlazi']
  },
  {
    code: 'TR',
    name: 'Turkey',
    phoneCode: '+90',
    flag: '🇹🇷',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    phoneCode: '+971',
    flag: '🇦🇪',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Dibba Al-Fujairah', 'Kalba', 'Jebel Ali', 'Madinat Zayed', 'Liwa Oasis', 'Ghayathi', 'Ruwais', 'Mezaira', 'Al Mirfa', 'Sila', 'Delma']
  },
  {
    code: 'TH',
    name: 'Thailand',
    phoneCode: '+66',
    flag: '🇹🇭',
    cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Hat Yai', 'Udon Thani', 'Nakhon Ratchasima', 'Khon Kaen', 'Rayong', 'Chonburi', 'Lampang', 'Surat Thani', 'Ubon Ratchathani', 'Nonthaburi', 'Pak Kret', 'Si Racha', 'Samut Prakan', 'Krabi', 'Songkhla', 'Nakhon Si Thammarat']
  },
  {
    code: 'ID',
    name: 'Indonesia',
    phoneCode: '+62',
    flag: '🇮🇩',
    cities: ['Jakarta', 'Surabaya', 'Bandung', 'Bekasi', 'Medan', 'Tangerang', 'Depok', 'Semarang', 'Palembang', 'Makassar', 'South Tangerang', 'Batam', 'Bogor', 'Pekanbaru', 'Bandar Lampung', 'Malang', 'Padang', 'Denpasar', 'Samarinda', 'Tasikmalaya']
  },
  {
    code: 'MY',
    name: 'Malaysia',
    phoneCode: '+60',
    flag: '🇲🇾',
    cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Malacca City', 'Kota Kinabalu', 'Kuching', 'Kajang', 'Ampang Jaya', 'Iskandar Puteri', 'Seremban', 'Subang Jaya', 'Kuala Terengganu', 'Kota Bharu', 'Sungai Petani', 'Miri', 'Taiping', 'Alor Setar']
  },
  {
    code: 'PH',
    name: 'Philippines',
    phoneCode: '+63',
    flag: '🇵🇭',
    cities: ['Manila', 'Quezon City', 'Caloocan', 'Davao', 'Cebu City', 'Zamboanga', 'Antipolo', 'Pasig', 'Taguig', 'Valenzuela', 'Dasmariñas', 'Calamba', 'Las Piñas', 'Makati', 'Bacolod', 'General Santos', 'Parañaque', 'Muntinlupa', 'Cagayan de Oro', 'Marikina']
  },
  {
    code: 'VN',
    name: 'Vietnam',
    phoneCode: '+84',
    flag: '🇻🇳',
    cities: ['Ho Chi Minh City', 'Hanoi', 'Hai Phong', 'Da Nang', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Buon Ma Thuot', 'Vung Tau', 'Nam Dinh', 'Qui Nhon', 'Long Xuyen', 'Thai Nguyen', 'Thanh Hoa', 'Rach Gia', 'Cam Ranh', 'Vinh', 'My Tho', 'Da Lat']
  },
  {
    code: 'PL',
    name: 'Poland',
    phoneCode: '+48',
    flag: '🇵🇱',
    cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice', 'Białystok', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom']
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    phoneCode: '+420',
    flag: '🇨🇿',
    cities: ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice', 'Zlín', 'Havířov', 'Kladno', 'Most', 'Opava', 'Frýdek-Místek', 'Karviná', 'Jihlava', 'Teplice', 'Děčín']
  },
  {
    code: 'AT',
    name: 'Austria',
    phoneCode: '+43',
    flag: '🇦🇹',
    cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn', 'Steyr', 'Wiener Neustadt', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden bei Wien', 'Wolfsberg', 'Leoben', 'Krems']
  },
  {
    code: 'BE',
    name: 'Belgium',
    phoneCode: '+32',
    flag: '🇧🇪',
    cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst', 'Mechelen', 'La Louvière', 'Kortrijk', 'Hasselt', 'Sint-Niklaas', 'Ostend', 'Tournai', 'Genk', 'Seraing', 'Roeselare']
  },
  {
    code: 'PT',
    name: 'Portugal',
    phoneCode: '+351',
    flag: '🇵🇹',
    cities: ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém', 'Queluz', 'Rio Tinto', 'Barreiro', 'Moita', 'Corroios', 'Entroncamento', 'Odivelas', 'Loures', 'Póvoa de Varzim', 'Rio Maior']
  },
  {
    code: 'GR',
    name: 'Greece',
    phoneCode: '+30',
    flag: '🇬🇷',
    cities: ['Athens', 'Thessaloniki', 'Patras', 'Piraeus', 'Larissa', 'Heraklion', 'Peristeri', 'Kallithea', 'Acharnes', 'Kalamaria', 'Nikaia', 'Glyfada', 'Volos', 'Ilio', 'Ilioupoli', 'Keratsini', 'Evosmos', 'Chalandri', 'Nea Ionia', 'Marousi']
  },
  {
    code: 'NO',
    name: 'Norway',
    phoneCode: '+47',
    flag: '🇳🇴',
    cities: ['Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Sarpsborg', 'Skien', 'Ålesund', 'Sandefjord', 'Haugesund', 'Tønsberg', 'Moss', 'Lørenskog', 'Bodø', 'Arendal', 'Porsgrunn']
  },
  {
    code: 'SE',
    name: 'Sweden',
    phoneCode: '+46',
    flag: '🇸🇪',
    cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje', 'Eskilstuna', 'Halmstad', 'Växjö', 'Karlstad', 'Sundsvall']
  },
  {
    code: 'DK',
    name: 'Denmark',
    phoneCode: '+45',
    flag: '🇩🇰',
    cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde', 'Herning', 'Hørsholm', 'Helsingør', 'Silkeborg', 'Næstved', 'Fredericia', 'Viborg', 'Køge', 'Holstebro', 'Taastrup']
  },
  {
    code: 'FI',
    name: 'Finland',
    phoneCode: '+358',
    flag: '🇫🇮',
    cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori', 'Kouvola', 'Joensuu', 'Lappeenranta', 'Hämeenlinna', 'Vaasa', 'Seinäjoki', 'Rovaniemi', 'Mikkeli', 'Kotka', 'Salo']
  },
  {
    code: 'IE',
    name: 'Ireland',
    phoneCode: '+353',
    flag: '🇮🇪',
    cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan', 'Ennis', 'Kilkenny', 'Carlow', 'Naas', 'Athlone', 'Portlaoise', 'Mullingar', 'Wexford', 'Letterkenny', 'Celbridge']
  },
  {
    code: 'IL',
    name: 'Israel',
    phoneCode: '+972',
    flag: '🇮🇱',
    cities: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beer Sheva', 'Bnei Brak', 'Holon', 'Ramat Gan', 'Rehovot', 'Ashkelon', 'Bat Yam', 'Beit Shemesh', 'Kfar Saba', 'Herzliya', 'Hadera', 'Modi\'in-Maccabim-Re\'ut', 'Nazareth']
  },
  {
    code: 'EG',
    name: 'Egypt',
    phoneCode: '+20',
    flag: '🇪🇬',
    cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta', 'Asyut', 'Ismailia', 'Fayyum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef', 'Hurghada']
  },
  {
    code: 'AR',
    name: 'Argentina',
    phoneCode: '+54',
    flag: '🇦🇷',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Santiago del Estero', 'Corrientes', 'Posadas', 'Bahía Blanca', 'Paraná', 'Neuquén', 'Formosa', 'San Luis', 'La Rioja']
  },
  {
    code: 'CL',
    name: 'Chile',
    phoneCode: '+56',
    flag: '🇨🇱',
    cities: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán', 'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Coquimbo', 'Osorno', 'Valdivia', 'Punta Arenas', 'Copiapó', 'Quillota']
  },
  {
    code: 'CO',
    name: 'Colombia',
    phoneCode: '+57',
    flag: '🇨🇴',
    cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Soledad', 'Ibagué', 'Bucaramanga', 'Soacha', 'Santa Marta', 'Villavicencio', 'Valledupar', 'Pereira', 'Montería', 'Itagüí', 'Pasto', 'Manizales', 'Neiva', 'Palmira']
  },
  {
    code: 'PE',
    name: 'Peru',
    phoneCode: '+51',
    flag: '🇵🇪',
    cities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna', 'Juliaca', 'Ica', 'Sullana', 'Ayacucho', 'Chincha Alta', 'Huánuco', 'Pucallpa', 'Tarapoto', 'Puno', 'Tumbes']
  }
];

// Helper functions
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(country => 
    country.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCitiesByCountryCode = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  return country?.cities || [];
};

export const getPhoneCodeByCountryCode = (countryCode: string): string | undefined => {
  const country = getCountryByCode(countryCode);
  return country?.phoneCode;
};

export const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
  const phoneCode = getPhoneCodeByCountryCode(countryCode);
  if (!phoneCode) return phoneNumber;
  
  // Remove any existing country code
  let cleanNumber = phoneNumber.replace(/^\+?\d{1,4}[-.\s]?/, '');
  // Remove any non-digit characters except spaces and hyphens
  cleanNumber = cleanNumber.replace(/[^\d\s-]/g, '');
  
  return `${phoneCode} ${cleanNumber}`;
};

export const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
  const phoneCode = getPhoneCodeByCountryCode(countryCode);
  if (!phoneCode) return false;
  
  // Basic validation - phone number should have at least 7 digits
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const searchCountries = (query: string): Country[] => {
  if (!query.trim()) return COUNTRIES;
  
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  );
};

export const searchCities = (query: string, countryCode?: string): string[] => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  if (countryCode) {
    const cities = getCitiesByCountryCode(countryCode);
    return cities.filter(city => 
      city.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Search across all countries
  const allCities: string[] = [];
  COUNTRIES.forEach(country => {
    const matchingCities = country.cities.filter(city =>
      city.toLowerCase().includes(lowerQuery)
    );
    allCities.push(...matchingCities);
  });
  
  // Remove duplicates and sort
  const uniqueCities = Array.from(new Set(allCities));
  return uniqueCities.sort();
}; 
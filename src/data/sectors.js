export const SP500_SECTORS = {
  'Technology': {
    color: '#0ea5e9',
    tickers: [
      'AAPL','MSFT','NVDA','AVGO','ORCL','CRM','AMD','QCOM','TXN','INTC',
      'AMAT','MU','ADI','KLAC','LRCX','NOW','PANW','SNPS','CDNS','MRVL',
      'FTNT','CSCO','IBM','HPQ','HPE','DELL','STX','WDC','KEYS','TERADYNE',
      'FFIV','JNPR','AKAM','CTSH','ACN','INFY','WIT',
    ],
  },
  'Healthcare': {
    color: '#22c55e',
    tickers: [
      'LLY','UNH','JNJ','ABBV','MRK','TMO','ABT','DHR','BMY','AMGN',
      'ISRG','SYK','VRTX','REGN','CI','ELV','HCA','MDT','ZTS','BSX',
      'BDX','EW','IQV','IDXX','ALGN','HOLX','PODD','DXCM','GEHC','RMD',
      'BAX','COO','TECH','MOH','CNC',
    ],
  },
  'Financials': {
    color: '#f59e0b',
    tickers: [
      'BRK-B','JPM','V','MA','BAC','WFC','GS','MS','AXP','BLK',
      'SPGI','CB','MMC','AON','PGR','TRV','MET','PRU','AFL','ALL',
      'USB','PNC','TFC','COF','DFS','SYF','AIG','HIG','WRB','RE',
      'CINF','GL','UNM','AIZ','FG',
    ],
  },
  'Consumer Disc.': {
    color: '#f97316',
    tickers: [
      'AMZN','TSLA','HD','MCD','NKE','LOW','SBUX','TJX','BKNG','CMG',
      'ORLY','AZO','ABNB','MAR','HLT','DHI','LEN','PHM','F','GM',
      'ROST','EBAY','ETSY','BBY','DG','DLTR','KMX','AN','GPC','POOL',
      'SNA','MHK','LEG','TPR','RL',
    ],
  },
  'Communication': {
    color: '#a855f7',
    tickers: [
      'META','GOOGL','GOOG','NFLX','DIS','CMCSA','T','VZ','TMUS','CHTR',
      'EA','TTWO','WBD','IPG','OMC','PARA','LYV','FOXA','FOX','NWS',
      'LUMN','CTL','SIRI','NYT','NWSA',
    ],
  },
  'Industrials': {
    color: '#64748b',
    tickers: [
      'CAT','RTX','HON','UPS','BA','GE','DE','LMT','NOC','GD',
      'EMR','ETN','MMM','ITW','PH','CMI','ROK','FDX','DAL','UAL',
      'LUV','AAL','JBLU','CSX','NSC','UNP','CP','CNI','WAB','GWW',
      'FAST','SWK','IR','RRX','XYL',
    ],
  },
  'Consumer Staples': {
    color: '#84cc16',
    tickers: [
      'WMT','PG','COST','KO','PEP','PM','MO','MDLZ','CL','GIS',
      'KHC','HSY','K','SJM','CPB','HRL','MKC','CAG','CHD','CLX',
      'EL','COTY','SPB','NWL','KDP','STZ','BF-B','TAP','SAM','CELH',
    ],
  },
  'Energy': {
    color: '#ef4444',
    tickers: [
      'XOM','CVX','COP','EOG','SLB','PSX','VLO','MPC','OXY','HAL',
      'BKR','DVN','HES','APA','MRO','OKE','WMB','KMI','ET','EPD',
      'MMP','TRGP','LNG','RRC','EQT','AR','SWN','CQP','MTDR','CIVI',
    ],
  },
  'Utilities': {
    color: '#06b6d4',
    tickers: [
      'NEE','DUK','SO','D','AEP','EXC','SRE','XEL','PCG','ED',
      'WEC','ES','FE','ETR','PPL','CMS','NI','AES','CNP','LNT',
      'AWK','PNW','EVRG','OGE','NWE','AVA','POR','HE','OTTR','SJW',
    ],
  },
  'Real Estate': {
    color: '#ec4899',
    tickers: [
      'AMT','PLD','CCI','EQIX','PSA','O','WELL','DLR','SPG','AVB',
      'EQR','VICI','WY','ARE','MAA','UDR','ESS','CPT','BXP','KIM',
      'REG','FRT','VTR','PEAK','HR','HIW','DEI','PDM','CUZ','EQC',
    ],
  },
  'Materials': {
    color: '#8b5cf6',
    tickers: [
      'LIN','SHW','APD','FCX','NEM','ECL','NUE','VMC','MLM','CF',
      'MOS','ALB','IFF','PPG','EMN','CE','WRK','PKG','IP','AVY',
      'RPM','SEE','SON','GPK','ATR','BALL','SLGN','BERY','GEF','REYN',
    ],
  },
};

export const RUSSELL_SECTORS = {
  'R2K Financials': {
    color: '#f59e0b',
    tickers: [
      'STBA','TOWN','NBTB','FFIN','BOKF','SFNC','HOMB','FBIZ','FBNC','BHLB',
      'HAFC','HOPE','BANR','CVBF','TRMK','IBCP','CZNC','NWBI','RRBI','UVSP',
    ],
  },
  'R2K Healthcare': {
    color: '#22c55e',
    tickers: [
      'ACAD','INVA','FOLD','RARE','PTGX','CRVS','APLS','RCUS','ARWR','FATE',
      'NVAX','IOVA','MGNX','SRPT','AGEN','BLUE','KPTI','MNKD','OCGN','FREQ',
    ],
  },
  'R2K Industrials': {
    color: '#64748b',
    tickers: [
      'ATKR','ARCB','WERN','HTLD','MRTN','USAK','ODFL','SAIA','ECHO','HUBG',
      'MATX','ULCC','SKYW','MESA','SAVE','HA','ALGT','SUN','GBX','TGI',
    ],
  },
  'R2K Technology': {
    color: '#0ea5e9',
    tickers: [
      'AMBA','COHU','FORM','ICHR','KLIC','LSCC','MCHP','ONTO','PLAB','RMBS',
      'SMTC','SYNA','UCTT','VLDR','ALGM','AEHR','CEVA','DIOD','ERII','FARO',
    ],
  },
  'R2K Consumer': {
    color: '#f97316',
    tickers: [
      'BOOT','CAKE','CBRL','CATO','DIN','EAT','JACK','TXRH','BJRI','DENN',
      'FRED','GDEN','GPMT','HGV','KURA','LOCO','NAVI','PLCE','RICK','SBH',
    ],
  },
  'R2K Energy': {
    color: '#ef4444',
    tickers: [
      'AMPY','BATL','CIVI','DINO','DKL','ESTE','FLNG','GPOR','HNRG','IMVT',
      'KINS','LONE','MGY','NGL','PAGP','PDCE','REX','SM','SBOW','TALO',
    ],
  },
  'R2K Real Estate': {
    color: '#ec4899',
    tickers: [
      'AHH','AIV','ALEX','BRT','CLPR','CSR','CUBE','EFC','ELME','EPR',
      'FCPT','FOR','GTY','IIPR','INN','JBGS','KRG','LAND','LTC','NXRT',
    ],
  },
  'R2K Materials': {
    color: '#8b5cf6',
    tickers: [
      'ASIX','BCPC','CATO','CLW','GEVO','HWKN','IOSP','KWR','LTHM','MTRN',
      'MYNZ','NGVT','OMN','PRLB','RYAM','SXC','TREC','USLM','WDFC','ZEUS',
    ],
  },
};

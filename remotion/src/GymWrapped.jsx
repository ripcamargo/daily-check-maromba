import { AbsoluteFill, Sequence } from 'remotion';
import { loadFont as loadBebas } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { Scene00_Loading } from './scenes/Scene00_Loading';
import { Scene01_Opening } from './scenes/Scene01_Opening';
import { Scene02_Numbers } from './scenes/Scene02_Numbers';
import { Scene03_TopPresentes } from './scenes/Scene03_TopPresentes';
import { Scene04_Hospital } from './scenes/Scene04_Hospital';
import { Scene05_Descanso } from './scenes/Scene05_Descanso';
import { Scene06_Bonus } from './scenes/Scene06_Bonus';
import { Scene07_Sumico } from './scenes/Scene07_Sumico';
import { Scene08_Desistentes } from './scenes/Scene08_Desistentes';
import { Scene09_Rankings } from './scenes/Scene09_Rankings';
import { Scene10_Titulos } from './scenes/Scene10_Titulos';
import { Scene11_Rivalidade } from './scenes/Scene11_Rivalidade';
import { Scene12_Financeiro } from './scenes/Scene12_Financeiro';
import { Scene13_Campeoes } from './scenes/Scene13_Campeoes';
import { Scene13b_Caloteiro } from './scenes/Scene13b_Caloteiro';
import { Scene14_Encerramento } from './scenes/Scene14_Encerramento';

const { waitUntilDone: waitBebas } = loadBebas();
const { waitUntilDone: waitInter } = loadInter();

waitBebas();
waitInter();

export const GymWrapped = ({ wrappedData, offsets }) => {
  const o = offsets;

  return (
    <AbsoluteFill style={{ background: '#0d0d0d', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sequence from={o.loading.start} durationInFrames={o.loading.duration}>
        <Scene00_Loading />
      </Sequence>

      <Sequence from={o.opening.start} durationInFrames={o.opening.duration}>
        <Scene01_Opening data={wrappedData} />
      </Sequence>

      <Sequence from={o.numbers.start} durationInFrames={o.numbers.duration}>
        <Scene02_Numbers data={wrappedData} />
      </Sequence>

      <Sequence from={o.topPresentes.start} durationInFrames={o.topPresentes.duration}>
        <Scene03_TopPresentes data={wrappedData} />
      </Sequence>

      <Sequence from={o.hospital.start} durationInFrames={o.hospital.duration}>
        <Scene04_Hospital data={wrappedData} />
      </Sequence>

      <Sequence from={o.descanso.start} durationInFrames={o.descanso.duration}>
        <Scene05_Descanso data={wrappedData} />
      </Sequence>

      <Sequence from={o.bonus.start} durationInFrames={o.bonus.duration}>
        <Scene06_Bonus data={wrappedData} />
      </Sequence>

      <Sequence from={o.sumico.start} durationInFrames={o.sumico.duration}>
        <Scene07_Sumico data={wrappedData} />
      </Sequence>

      <Sequence from={o.desistentes.start} durationInFrames={o.desistentes.duration}>
        <Scene08_Desistentes data={wrappedData} />
      </Sequence>

      <Sequence from={o.rankings.start} durationInFrames={o.rankings.duration}>
        <Scene09_Rankings data={wrappedData} />
      </Sequence>

      <Sequence from={o.titulos.start} durationInFrames={o.titulos.duration}>
        <Scene10_Titulos data={wrappedData} sceneDuration={o.titulos.duration} />
      </Sequence>

      <Sequence from={o.rivalidade.start} durationInFrames={o.rivalidade.duration}>
        <Scene11_Rivalidade data={wrappedData} />
      </Sequence>

      <Sequence from={o.financeiro.start} durationInFrames={o.financeiro.duration}>
        <Scene12_Financeiro data={wrappedData} />
      </Sequence>

      <Sequence from={o.campeoes.start} durationInFrames={o.campeoes.duration}>
        <Scene13_Campeoes data={wrappedData} />
      </Sequence>

      <Sequence from={o.caloteiro.start} durationInFrames={o.caloteiro.duration}>
        <Scene13b_Caloteiro data={wrappedData} />
      </Sequence>

      <Sequence from={o.encerramento.start} durationInFrames={o.encerramento.duration}>
        <Scene14_Encerramento data={wrappedData} />
      </Sequence>
    </AbsoluteFill>
  );
};

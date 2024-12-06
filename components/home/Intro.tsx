import { BsTypeH2 } from "react-icons/bs";
import { LineText } from "../LineText";
import { Image } from "@nextui-org/image";
import { RoughNotation } from "react-rough-notation";
import { ROUGH_NOTATION_BACKGROUND_COLOR } from "@/config/color";


const Intro = ({ locale }: { locale: any; }) => {
  return (
    <>
      <div className="w-full mx-auto mt-24 gap-4">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-0 md:pt-0 text-center">
          {/* <h3>
            {locale.title}
          </h3> */}
          <h2 className="text-center text-white">
            <RoughNotation
              type="highlight"
              show={true}
              color={ROUGH_NOTATION_BACKGROUND_COLOR}
            >
              {locale.title}
            </RoughNotation>
          </h2>
          <p className="mx-auto mt-6 mb-12 max-w-4xl text-l tracking-tight text-slate-700 dark:text-slate-400">
            {/* {siteConfig.description} */}
            {locale.description1}
          </p>
          <h2 className="text-center text-white">
            <RoughNotation
              type="highlight"
              show={true}
              color={ROUGH_NOTATION_BACKGROUND_COLOR}
            >
              {locale.effect}
            </RoughNotation>
          </h2>
          <div className="mx-auto mt-6 max-w-4xl text-l tracking-tight text-slate-700 dark:text-slate-400">
            <Image src={'/images/effect/effect.jpg'} alt="effect" />
          </div>
        </section>
      </div>
      {/* <CTAButton locale={CTALocale}></CTAButton> */}
    </>
  );
};

export default Intro;


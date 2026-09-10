import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collectorInfoSchema, type CollectorInfo } from "@/api/contracts/orders";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";

export type CollectorInfoFormHandle = {
  submit: () => Promise<CollectorInfo | null>;
};

export const CollectorInfoForm = forwardRef<
  CollectorInfoFormHandle,
  { defaultValues?: Partial<CollectorInfo> }
>(function CollectorInfoForm({ defaultValues }, ref) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectorInfo>({
    resolver: zodResolver(collectorInfoSchema),
    defaultValues,
  });

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) => {
        handleSubmit(
          (values) => resolve(values),
          () => resolve(null)
        )();
      }),
  }));

  return (
    <form noValidate className="flex flex-col gap-4">
      <FormField id="collector-name" label="Nome completo" error={errors.name?.message}>
        <Input
          id="collector-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </FormField>

      <FormField id="collector-email" label="E-mail" error={errors.email?.message}>
        <Input
          id="collector-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField id="collector-document" label="Documento (CPF/ID)" error={errors.document?.message}>
        <Input
          id="collector-document"
          autoComplete="off"
          aria-invalid={Boolean(errors.document)}
          {...register("document")}
        />
      </FormField>
    </form>
  );
});
